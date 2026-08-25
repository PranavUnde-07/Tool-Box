/* TOOLBOX API integration tests — run with: npm test -w server */
import request from 'supertest';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import app from '../src/app';

let pass = 0;
function ok(name: string, cond: boolean, extra = ''): void {
  if (!cond) throw new Error(`FAIL ${name} ${extra}`);
  pass++;
  console.log(`  PASS ${name}`);
}

async function pngBuffer(): Promise<Buffer> {
  return sharp({ create: { width: 600, height: 400, channels: 3, background: { r: 10, g: 200, b: 90 } } })
    .png()
    .toBuffer();
}

async function pdfBuffer(pages = 2): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) {
    doc.addPage([595, 842]).drawText(`page ${i + 1}`, { x: 40, y: 700, size: 20 });
  }
  return Buffer.from(await doc.save());
}

async function main(): Promise<void> {
  // ── Health ──
  const health = await request(app).get('/api/health').expect(200);
  ok('health', health.body.success === true);

  // ── Image resize roundtrip ──
  const resize = await request(app)
    .post('/api/image/resize')
    .field('width', '300')
    .field('height', '200')
    .field('maintainAspect', 'false')
    .attach('file', await pngBuffer(), 'photo.png')
    .expect(200);
  const meta = await sharp(resize.body).metadata();
  ok('resize → exact dims', meta.width === 300 && meta.height === 200);

  // ── Spoofed content rejected ──
  const spoof = await request(app)
    .post('/api/image/resize')
    .field('width', '10')
    .field('height', '10')
    .attach('file', Buffer.from('<script>alert(1)</script>'), 'evil.png');
  ok('spoofed file rejected', spoof.status === 400 && spoof.body.code === 'INVALID_MIME');

  // ── Invalid params rejected ──
  const bad = await request(app)
    .post('/api/image/resize')
    .field('width', '-50')
    .field('height', '99999')
    .attach('file', await pngBuffer(), 'x.png');
  ok('bad params rejected', bad.status === 400 && bad.body.code === 'INVALID_PARAMS');

  // ── Missing file ──
  const noFile = await request(app).post('/api/image/crop');
  ok('missing file rejected', noFile.status === 400 && noFile.body.code === 'MISSING_FILE');

  // ── Merge requires ≥2 files ──
  const single = await request(app)
    .post('/api/pdf/merge')
    .attach('files', await pdfBuffer(1), 'only.pdf');
  ok('merge rejects single file', single.status === 400);

  // ── Merge happy path ──
  const merged = await request(app)
    .post('/api/pdf/merge')
    .attach('files', await pdfBuffer(1), 'a.pdf')
    .attach('files', await pdfBuffer(2), 'b.pdf')
    .expect(200);
  const mergedDoc = await PDFDocument.load(merged.body);
  ok('merge → 3 pages', mergedDoc.getPageCount() === 3);

  // ── QR generation ──
  const qr = await request(app)
    .post('/api/qr/generate')
    .send({ text: 'https://toolbox.local', size: '256' })
    .expect(200);
  ok('qr png generated', qr.body.length > 500);

  // ── Rate limit headers present ──
  const rl = await request(app).get('/api/health');
  ok('rate limit headers', !!rl.headers['ratelimit-limit'] || !!rl.headers['ratelimit-policy']);

  console.log(`\nAPI RESULT: ${pass} passed`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
