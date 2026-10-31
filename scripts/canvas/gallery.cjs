/**
 * A room photo opens the room's mini gallery in Play (the Results and the sanatorium boards):
 * the photos of every room are read on the live page, the gallery window is captured once
 * (by its data-canvas mark «room-gallery») and the board's logic flips the pictures.
 */
const IA = require('./interactive.cjs');
const { act } = require('./find.cjs');
const { post, grab } = require('./core.cjs');

const PHOTO_BTN = { canvas: 'room-card', role: 'button', name: 'Смотреть фото номера' };

async function roomGallery(b, route, setup, helpers) {
  const rooms = await grab(
    b,
    route,
    setup,
    async () => {
      const out = [];
      const btns = window.__find({ canvas: 'room-card', role: 'button', name: 'Смотреть фото номера' });
      for (const bt of btns) {
        bt.click();
        await new Promise((r) => setTimeout(r, 150));
        const g = document.querySelector('[data-canvas="room-gallery"]');
        const thumbs = Array.from(g.querySelectorAll('.rg-thumb img'));
        const main = g.querySelector('.rg-img');
        out.push({
          title: g.querySelector('.rg-title strong').textContent,
          photos: thumbs.length
            ? thumbs.map((t, k) => ({
                src: t.getAttribute('src'),
                alt: g
                  .querySelectorAll('.rg-thumb')
                  [k].getAttribute('aria-label')
                  .replace(/^Фото \d+: /, ''),
              }))
            : [{ src: main.getAttribute('src'), alt: main.getAttribute('alt') }],
        });
        window.__find({ canvas: 'room-gallery', role: 'button', name: 'Закрыть' })[0].click();
        await new Promise((r) => setTimeout(r, 80));
      }
      return out;
    },
    undefined,
    helpers,
  );
  const rgHtml = rooms.length
    ? await grab(
        b,
        route,
        async (p) => {
          if (setup) await setup(p);
          await act(p, [{ click: PHOTO_BTN }]);
        },
        () => {
          const d = window.__dc;
          const o = document.querySelector('[data-canvas="room-gallery"]');
          d.text(o.querySelector('.rg-title strong'), 'rgTitle');
          d.text(o.querySelector('.rg-title span'), 'rgLine');
          const img = o.querySelector('.rg-img');
          d.attr(img, 'src', 'rgSrc');
          d.attr(img, 'alt', 'rgAlt');
          d.on(window.__find({ canvas: 'room-gallery', role: 'button', name: 'Закрыть' })[0], 'click', 'rgClose');
          d.on(
            window.__find({ canvas: 'room-gallery', role: 'button', name: 'Предыдущее фото' })[0],
            'click',
            'rgPrev',
          );
          d.on(window.__find({ canvas: 'room-gallery', role: 'button', name: 'Следующее фото' })[0], 'click', 'rgNext');
          const th = o.querySelector('[role="group"]');
          if (th) {
            th.innerHTML = '';
            th.appendChild(d.raw('rgthumbs'));
          }
          return o.outerHTML;
        },
        undefined,
        helpers,
      )
    : '';
  const blob = (u) => String(u || '').replace(/^\/img\/([0-9a-f]{32})\.[a-z]+$/, '/_blob/$1');
  const roomPics = rooms.map((r) => ({
    title: r.title,
    photos: r.photos.map((x) => ({ src: blob(x.src), alt: x.alt })),
  }));
  return { roomPics, rgHtml };
}

/** the gallery pop-up, shown while a room's photos are open */
const rgRaw = (rgHtml) =>
  rgHtml
    ? '<sc-if value="{{rgOn}}" hint-placeholder-val="{{false}}">' +
      IA.finish(post(rgHtml), {
        rgthumbs:
          '<sc-for list="{{rgThumbs}}" as="t" hint-placeholder-count="4"><button type="button" class="{{t.cls}}" onClick="{{t.pick}}"><img src="{{t.src}}" alt=""></button></sc-for>',
      }) +
      '</sc-if>'
    : '';

/** board logic: open / browse / close a room's photos (inside renderVals, with v and st) */
const rgLogic = (roomPics) => `
    const ROOMS = ${JSON.stringify(roomPics)};
    const r = ROOMS[st.rg], pics = r ? r.photos : [], k = pics.length ? ((st.rgI % pics.length) + pics.length) % pics.length : 0;
    ROOMS.forEach((_, i) => (v['rgOpen' + i] = () => this.setState({ rg: i, rgI: 0 })));
    Object.assign(v, {
      rgOn: !!r, rgTitle: r ? r.title : '', rgSrc: pics[k] ? pics[k].src : '', rgAlt: pics[k] ? pics[k].alt : '',
      rgLine: r ? (k + 1) + ' из ' + pics.length + ' · ' + (pics[k] ? pics[k].alt : '') : '',
      rgThumbs: pics.map((p, j) => ({ src: p.src, cls: 'rg-thumb' + (j === k ? ' on' : ''), pick: () => this.setState({ rgI: j }) })),
      rgPrev: () => this.setState({ rgI: k - 1 }), rgNext: () => this.setState({ rgI: k + 1 }), rgClose: () => this.setState({ rg: -1 }),
    });`;

module.exports = { roomGallery, rgRaw, rgLogic };
