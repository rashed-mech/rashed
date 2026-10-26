import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import seed from '../../data/portfolio_db.json';

test('saved data refreshes across instances and citation totals persist consistently', async () => {
  const originalMode = process.env.NODE_ENV;
  const originalServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const originalGoogleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalDefaultCredentials = process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS;
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-db-test-'));
  const dataDirectory = path.join(tempDirectory, 'data');
  const localFile = path.join(dataDirectory, 'portfolio.local.json');
  fs.mkdirSync(dataDirectory);
  fs.writeFileSync(localFile, JSON.stringify(seed));

  try {
    process.env.NODE_ENV = 'development';
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS;
    const { PortfolioDatabase } = await import('./db');
    const database = new PortfolioDatabase(localFile);
    await database.waitUntilReady();

    database.updateProfile({ name: 'Saved locally' });
    await database.flush();
    assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).profile.name, 'Saved locally');
    database.addMessage({ name: 'Visitor', email: 'visitor@example.invalid', subject: 'Hello', message: 'A local test message' });
    await database.flush();
    assert.equal(database.getMessages().length, 1);
    assert.equal('messages' in database.getPublicData(), false);
    database.updateThemeUX({ activeDesign: 'design-7' });
    await database.flush();

    const restarted = new PortfolioDatabase(localFile);
    await restarted.waitUntilReady();
    assert.equal(restarted.getFullData().profile.name, 'Saved locally');
    assert.equal(restarted.getMessages().length, 1);
    assert.equal(restarted.getFullData().themeUX.activeDesign, 'design-7');
    restarted.updateThemeUX({ activeDesign: 'current' });
    await restarted.flush();
    assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).themeUX.activeDesign, 'current');

    process.env.NODE_ENV = 'production';
    restarted.updateProfile({ name: 'Unsaved change' });
    await assert.rejects(restarted.flush(), /credentials are required/);
    assert.equal(restarted.getFullData().profile.name, 'Saved locally');
    assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).profile.name, 'Saved locally');

    process.env.NODE_ENV = 'development';
    restarted.updateProfile({ name: 'Recovered after failure' });
    await restarted.flush();
    assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).profile.name, 'Recovered after failure');

    // A legacy export can contain fresh papers and an older profile summary.
    const legacy = structuredClone(seed);
    legacy.publications.forEach((paper, index) => { paper.citations = index === 0 ? 10 : index === 1 ? 6 : 0; });
    // This fixture exercises citations for published papers irrespective of the
    // workflow states of the first two records in the editable seed backup.
    Object.assign(legacy.publications[0], { publicationStatus: 'Published' });
    Object.assign(legacy.publications[1], { publicationStatus: 'Published' });
    legacy.profile.stats.citations = 14;
    fs.writeFileSync(localFile, JSON.stringify(legacy));
    await restarted.refresh();
    assert.equal(restarted.getPublicData().profile.stats.citations, 16);
    assert.equal(restarted.getPublicData().profile.stats.hIndex, 2);
    const { OverviewSection } = await import('../components/OverviewSection');
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const markup = renderToStaticMarkup(createElement(OverviewSection, {
      data: legacy as unknown as import('../types').PortfolioData,
      profile: legacy.profile as unknown as import('../types').Profile
    }));
    assert.match(markup, />16<\/span>/, 'public badge derives 16 even when legacy profile stats still say 14');
    assert.equal(restarted.syncPublicationCitations({}), true);
    await restarted.flush();
    assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).profile.stats.citations, 16);
    assert.equal(restarted.syncPublicationCitations({}), false);

    const { createApp } = await import('./createApp');
    const { createServer } = await import('node:http');
    let scholarResult = { ok: false, html: '', fresh: false, message: 'Scholar unavailable' };
    let requestedUrl = '';
    const application = await createApp(restarted, async raw => {
      requestedUrl = String(raw);
      return scholarResult;
    });
    const server = createServer(application);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as { port: number };
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const initial = await fetch(`${base}/api/portfolio`);
      assert.equal(initial.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');
      const initialData = (await initial.json()).data;
      assert.equal(initialData.profile.stats.citations, 16);
      assert.equal('messages' in initialData, false);

      // A warm instance must see changes saved by a different instance.
      const otherInstance = new PortfolioDatabase(localFile);
      await otherInstance.waitUntilReady();
      otherInstance.updateProfile({ headline: 'Saved by another server instance' });
      await otherInstance.flush();
      const refreshed = await (await fetch(`${base}/api/portfolio`)).json();
      assert.equal(refreshed.data.profile.headline, 'Saved by another server instance');

      // Failed scraping keeps saved paper counts and returns the saved summary.
      const unavailable = await (await fetch(`${base}/api/scholar/sync`, { method: 'POST' })).json();
      assert.equal(unavailable.synced, false);
      assert.equal(unavailable.data.profile.stats.citations, 16);

      const paperA = legacy.publications[0];
      const paperB = legacy.publications[1];
      const escapeHtml = (title: string) => title.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
      scholarResult = {
        ok: true, fresh: true, message: '',
        html: `<table><tr class="gsc_a_tr"><td class="gsc_a_at">${escapeHtml(paperA.title)}</td><td class="gsc_a_ac">11</td></tr><tr class="gsc_a_tr"><td class="gsc_a_at">${escapeHtml(paperB.title)}</td><td class="gsc_a_ac">7</td></tr></table>`
      };
      // A caller-supplied URL is ignored; only the stored owner's profile is used.
      const synchronized = await (await fetch(`${base}/api/scholar/sync?url=https://example.invalid/`, { method: 'POST' })).json();
      assert.equal(synchronized.success, true);
      assert.equal(synchronized.changed, true);
      assert.equal(synchronized.data.profile.stats.citations, 18);
      assert.match(requestedUrl, /^https:\/\/scholar\.google\.com\/citations\?/);
      const savedAfterSync = JSON.parse(fs.readFileSync(localFile, 'utf8'));
      assert.equal(savedAfterSync.profile.stats.citations, 18);
      assert.equal(savedAfterSync.publications[0].citations, 11);
      assert.equal(savedAfterSync.publications[1].citations, 7);
      assert.equal((await (await fetch(`${base}/api/scholar/stats`)).json()).data.citations, 18);
      assert.equal(restarted.getFullData().profile.stats.citations, 18);
      const unchanged = await (await fetch(`${base}/api/scholar/sync`, { method: 'POST' })).json();
      assert.equal(unchanged.changed, false);

      scholarResult = { ...scholarResult, fresh: false, html: scholarResult.html.replace('>11<', '>9<') };
      const cached = await (await fetch(`${base}/api/scholar/sync`, { method: 'POST' })).json();
      assert.equal(cached.data.profile.stats.citations, 18, 'cached scraping cannot roll back newer saved counts');

      // Never report a successful sync if persistence fails.
      scholarResult = { ...scholarResult, fresh: true, html: scholarResult.html.replace('>9<', '>12<') };
      const originalRename = fs.promises.rename;
      try {
        fs.promises.rename = async () => { throw new Error('Simulated unavailable storage'); };
        const failed = await fetch(`${base}/api/scholar/sync`, { method: 'POST' });
        assert.equal(failed.status, 503);
        assert.equal((await failed.json()).success, false);
      } finally {
        fs.promises.rename = originalRename;
      }
      assert.equal(restarted.getFullData().profile.stats.citations, 18);
      assert.equal(JSON.parse(fs.readFileSync(localFile, 'utf8')).profile.stats.citations, 18);

      restarted.deletePublication(paperA.id);
      await restarted.flush();
      assert.equal(restarted.getFullData().profile.stats.citations, 7);
      assert.equal(restarted.getFullData().profile.stats.hIndex, 1);

      const { getPublicationStatus } = await import('../utils/publicationStatus');
      assert.equal(getPublicationStatus({ category: 'Journal', venue: 'Submitted' }), 'Submitted');
      assert.equal(getPublicationStatus({ category: 'Conference', statusNote: 'Under Review' }), 'Under Review');
      assert.equal(getPublicationStatus({ publicationStatus: 'Published', venue: 'Submitted' }), 'Published');
      const originalVerifyAdmin = restarted.verifyAdmin;
      const originalAdminConfig = restarted.getAdminConfig;
      try {
        restarted.verifyAdmin = (username, password) => username === 'publication-workflow-test' && password === 'temporary-test-password';
        restarted.getAdminConfig = () => ({ username: 'publication-workflow-test', lastUpdated: '' });
        const login = await (await fetch(`${base}/api/auth/login`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({username: 'publication-workflow-test', password: 'temporary-test-password'}),
        })).json();
        assert.equal(login.success, true);
        const headers = {'Content-Type':'application/json', Authorization: `Bearer ${login.token}`};
        const addedResponse = await fetch(`${base}/api/admin/publications`, {
          method: 'POST', headers, body: JSON.stringify({title:'Conference awaiting review', authors:'Owner', category:'Conference', publicationStatus:'Under Review', year:2026, abstract:'', tags:[]}),
        });
        assert.equal(addedResponse.status, 201, 'Pending papers do not require a venue or Scholar link');
        const added = (await addedResponse.json()).data;
        assert.equal(added.venue, '');
        const desiredOrder = restarted.getPublications().map(paper => paper.id).reverse();
        const reordered = await fetch(`${base}/api/admin/publications/reorder`, {method:'PUT', headers, body:JSON.stringify({orderedIds:desiredOrder})});
        assert.equal(reordered.status, 200, 'Reorder route must precede the publication ID route');
        assert.deepEqual((await reordered.json()).data.map((paper: any) => paper.id), desiredOrder);
        const invalid = await fetch(`${base}/api/admin/publications/reorder`, {method:'PUT', headers, body:JSON.stringify({orderedIds:[added.id, added.id]})});
        assert.equal(invalid.status, 409);
        const updated = await (await fetch(`${base}/api/admin/publications/${added.id}`, {method:'PUT', headers, body:JSON.stringify({category:'Review',publicationStatus:'Submitted'})})).json();
        assert.equal(updated.data.publicationStatus, 'Submitted');
        assert.equal(updated.data.category, 'Review');
        await fetch(`${base}/api/admin/publications/${added.id}`, {method:'DELETE',headers});
      } finally {
        restarted.verifyAdmin = originalVerifyAdmin;
        restarted.getAdminConfig = originalAdminConfig;
      }
      const pending = restarted.addPublication({
        title: 'Manual review awaiting a decision', authors: 'Owner', venue: '', year: 2026,
        category: 'Review', publicationStatus: 'Submitted', abstract: 'Keep manual details', tags: [], citations: 0,
      });
      await restarted.flush();
      const order = restarted.getPublications().map(paper => paper.id).reverse();
      restarted.reorderPublications(order);
      await restarted.flush();
      assert.deepEqual(JSON.parse(fs.readFileSync(localFile, 'utf8')).publications.map((paper: any) => paper.id), order);
      assert.throws(() => restarted.reorderPublications([order[0], order[0]]), /Refresh/);
      assert.equal((await fetch(`${base}/api/admin/publications/reorder`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({orderedIds: order}) })).status, 401);

      const scholarRow = (title: string) => `<tr class="gsc_a_tr"><td><a class="gsc_a_at" href="/citations?view_op=view_citation&amp;citation_for_view=owner:test">${title}</a><div class="gs_gray">Scholar Author</div><div class="gs_gray">Test Journal</div></td><td class="gsc_a_ac">4</td><td class="gsc_a_y">2026</td></tr>`;
      scholarResult = {ok: true, fresh: true, message: '', html: `<table>${scholarRow(pending.title)}${scholarRow('New indexed publication')}</table>`};
      const imported = await (await fetch(`${base}/api/scholar/sync`, {method:'POST'})).json();
      assert.equal(imported.success, true);
      const savedPending = imported.data.publications.find((paper: any) => paper.id === pending.id);
      assert.equal(savedPending.publicationStatus, 'Submitted');
      assert.equal(savedPending.category, 'Review');
      assert.equal(savedPending.abstract, 'Keep manual details');
      assert.equal(savedPending.citations, 0, 'Scholar must not overwrite pending work');
      assert.deepEqual(imported.data.publications.slice(0, order.length).map((paper: any) => paper.id), order);
      assert.equal(imported.data.publications.at(-1).publicationStatus, 'Published');
      const again = await (await fetch(`${base}/api/scholar/sync`, {method:'POST'})).json();
      assert.equal(again.changed, false, 'Repeated sync must not duplicate papers');
      const reloaded = new PortfolioDatabase(localFile);
      await reloaded.waitUntilReady();
      assert.equal(reloaded.getPublications().find(paper => paper.id === pending.id)?.publicationStatus, 'Submitted');
      assert.deepEqual(reloaded.getPublications().slice(0, order.length).map(paper => paper.id), order);

    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  } finally {
    const { getApps, deleteApp } = await import('firebase/app');
    await Promise.all(getApps().map(app => deleteApp(app)));
    if (originalMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = originalMode;
    if (originalServiceAccount === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON; else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalServiceAccount;
    if (originalGoogleCredentials === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS; else process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGoogleCredentials;
    if (originalDefaultCredentials === undefined) delete process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS; else process.env.FIREBASE_USE_APPLICATION_DEFAULT_CREDENTIALS = originalDefaultCredentials;
    if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
    const temporaryFile = `${localFile}.tmp`;
    if (fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile);
    fs.rmdirSync(dataDirectory);
    fs.rmdirSync(tempDirectory);
  }
});
