const dpr = window.devicePixelRatio || 1;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";

const BASE_WIDTH = GetIntParam("width") || 502;
const TARGET_WIDTH = GetIntParam("targetWidth") || (BASE_WIDTH === 502 ? 648 : BASE_WIDTH); 
const scaleFactor = TARGET_WIDTH / BASE_WIDTH; 

document.documentElement.style.setProperty('--width', `${BASE_WIDTH}px`);
document.body.style.width = `${BASE_WIDTH}px`;
document.body.style.height = `${100 / scaleFactor}vh`;
document.body.style.transform = `scale(${scaleFactor})`;
document.body.style.transformOrigin = "top left";

const showPlatform = GetBooleanParam("showPlatform", true);
const showAvatar = GetBooleanParam("showAvatar", true);
const showTimestamps = GetBooleanParam("showTimestamps", true);
const showBadges = GetBooleanParam("showBadges", true);
const showUsername = GetBooleanParam("showUsername", true);
const showMessage = GetBooleanParam("showMessage", true);
const showTopGradient = GetBooleanParam("showTopGradient", true);
// Word-by-word reveal on message bodies (see writeInMessage). On by default so
// existing browser-source URLs pick it up; add ?writingAnimation=false to turn it
// off, which is worth doing if the streaming machine is running hot.
const writingAnimation = GetBooleanParam("writingAnimation", true);
/* ── Boil feel: two separate knobs ──────────────────────────────────────────
   boilFps  — how OFTEN the border is redrawn.
   boilStep — how DIFFERENT each redraw is from the one before it.

   These used to be the same knob, which is why the line looked like it was
   moving rather than being redrawn. The noise clock was wall time, so between
   two drawn frames the field advanced by noiseTimeScale/boilFps ≈ 0.04 — and 3D
   simplex decorrelates over roughly 1.0 of z, so each "new" drawing was a 4%
   nudge of the last one. Lowering boilFps alone just made that same smooth drift
   chug; it never got sketchier, because the shapes were still nearly identical.

   Driving the noise off the drawing COUNT instead of the clock separates them: a
   step of about 0.5 gives a fully independent drawing every time. Measured on
   these cards, 0.042 moves each point 0.14px between drawings; 0.178 moves it
   about 0.6px, roughly half of the distance two unrelated drawings sit apart —
   enough that each one reads as redrawn, close enough that they still look like
   the same hand drew them. Past ~0.5 there is nothing left to gain.

   Time is quantised to the drawing grid, so every boiling outline in the scene
   changes on the same beat — the way everything on an animator's sheet updates
   on the same frame — and the same expression gives both the noise coordinate
   and the redraw throttle: if the index has not moved, there is nothing new to
   draw.

   Shape is untouched: noiseAmp stays 1.5, so the card silhouette is the same as
   before. This changes how the line is *redrawn*, not how far it wanders.
   ?boilAmp=N raises the wander if you want it rougher still.

   To get the old smooth drift back exactly: ?boilFps=24&boilStep=0.042           */
const boilFps = Math.max(1, Math.min(60, GetIntParam("boilFps") || 7));
const boilStep = Math.max(0, Math.min(4, GetFloatParam("boilStep") ?? 0.178));

const font = urlParams.get("font") || "";
const fontSize = urlParams.get("fontSize") || "18";
const fontColor = urlParams.get("fontColor") || "#ffffff";
const contrastOutline = GetBooleanParam("contrastOutline", false);
const background = urlParams.get("background") || "#ffffff";
const backgroundOpacity = GetIntParam("backgroundOpacity") ?? 100;

const hideAfter = GetIntParam("hideAfter") || 0;
const excludeCommands = GetBooleanParam("excludeCommands", true);
const ignoreChatters = urlParams.get("ignoreChatters") || "";
const scrollDirection = GetIntParam("scrollDirection") || 1;
const imageEmbedPermissionLevel = GetIntParam("imageEmbedPermissionLevel") || 20;

const showTwitchMessages = GetBooleanParam("showTwitchMessages", true);
const showTwitchAnnouncements = GetBooleanParam("showTwitchAnnouncements", true);
const showTwitchSubs = GetBooleanParam("showTwitchSubs", true);
const showTwitchRaids = GetBooleanParam("showTwitchRaids", true);
const showTwitchFollows = GetBooleanParam("showTwitchFollows", true);
const showTwitchCheers = GetBooleanParam("showTwitchCheers", true);
const showTwitchChannelPoints = GetBooleanParam("showTwitchChannelPoints", true);
const showTwitchPowerUps = GetBooleanParam("showTwitchPowerUps", true);
const showTwitchWatchStreaks = GetBooleanParam("showTwitchWatchStreaks", true);

// Stinger sync: when ON, a Twitch sub/resub/gift/bomb or cheer fades the chat out,
// lets the separate stinger browser source play, then fades the chat back in and
// only THEN shows the alert card. Default OFF so existing links (no ?stingers) are
// unchanged — the settings page only appends ?stingers=true when it's enabled.
const stingersEnabled = GetBooleanParam("stingers", false);

const showYouTubeMessages = GetBooleanParam("showYouTubeMessages", true);
const showYouTubeSuperChats = GetBooleanParam("showYouTubeSuperChats", true);
const showYouTubeSuperStickers = GetBooleanParam("showYouTubeSuperStickers", true);
const showYouTubeMemberships = GetBooleanParam("showYouTubeMemberships", true);

const showStreamlabsDonations = GetBooleanParam("showStreamlabsDonations", true);
const showStreamElementsTips = GetBooleanParam("showStreamElementsTips", true);
const showPatreon = GetBooleanParam("showPatreon", true);
const showKofi = GetBooleanParam("showKofi", true);
const showTipeeeStream = GetBooleanParam("showTipeeeStream", true);
const showFourthwall = GetBooleanParam("showFourthwall", true);
const showKickMessages = GetBooleanParam("showKickMessages", true);
const showKickFollows = GetBooleanParam("showKickFollows", true);
const showKickSubs = GetBooleanParam("showKickSubs", true);
const showTikTokChat = GetBooleanParam("showTikTokChat", true);
const showTikTokFollows = GetBooleanParam("showTikTokFollows", true);
const showTikTokGifts = GetBooleanParam("showTikTokGifts", true);
const showTikTokSubs = GetBooleanParam("showTikTokSubs", true);

if (font) document.body.style.fontFamily = font;
document.body.style.fontSize = `${fontSize}px`;
document.documentElement.style.setProperty('--font-color', fontColor);
if (contrastOutline) document.body.classList.add('contrast-outline');

/* ══ Contrast outline + 3D extrude ═══════════════════════════════════════════
   Always on — it is no longer behind ?contrastOutline. Chat messages only; the
   bordered cards have their own solid backgrounds and are untouched.

   Four techniques, because four different kinds of shape:
     text / usernames   16-copy text-shadow ring, then a filter extrude
     reply arrow + line  one inline SVG drawing the path twice (wide dark, then light)
     badges + platform   a mask UNION, built below
     avatars             box-shadow rings (a disc IS its border box)

   Two rasteriser facts drive the whole design:

   1. Chained drop-shadow offsets are FLOORED to whole pixels. A fractional per-pass
      offset therefore contributes nothing at all, and 1.01px through 1.99px all
      contribute exactly one pixel. So the extrude is built as N passes of exactly
      1px and the DEPTH is varied by changing N, not by scaling the offset.
   2. Chained passes compose as a Minkowski sum, so ±1px in x and y makes a SQUARE
      dilation whose corner pixel is a tooth on any 45° contour — and each extrude
      pass then carries that tooth another pixel down. Mask layers under
      mask-composite:add are a true union instead, with no compounding, and they
      are not floored, so the ring can sample a real circle at fractional offsets
      and a rounded corner comes out at radius R + r.                            */
const OUTLINE = {
	hrEm:     0.05,   // outline thickness, em
	depthEm:  0.13,   // 3D extrude depth, em
	imgScale: 1,      // extrude multiplier for badges / platform icons
	avScale:  0.9,    // ...and for avatars: a full-bleed disc shows its whole
	                  //    extrude as one crescent and reads deeper than it measures
	dirX: 0, dirY: 1, // straight down
	colour: '#000000',
	ringPoints: 12,   // 12 is where the polygon stops reading as a polygon at icon size
};

const _oFs    = Number(fontSize) || 18;
const _oHr    = Math.max(0.5, OUTLINE.hrEm * _oFs);
const _oDepth = OUTLINE.depthEm * _oFs;

// N passes of exactly 1px, walking integer positions along the direction vector.
function BuildExtrudeFilter(totalPx) {
	const n = Math.round(totalPx);
	if (n < 1) return 'none';
	const tx = OUTLINE.dirX * totalPx, ty = OUTLINE.dirY * totalPx;
	const out = [];
	let px = 0, py = 0;
	for (let k = 1; k <= n; k++) {
		const qx = Math.round(tx * k / n), qy = Math.round(ty * k / n);
		if (qx - px || qy - py) out.push(`drop-shadow(${qx - px}px ${qy - py}px 0 ${OUTLINE.colour})`);
		px = qx; py = qy;
	}
	return out.length ? out.join(' ') : 'none';
}

const _oRoot = document.documentElement.style;
_oRoot.setProperty('--o-hr', _oHr + 'px');
_oRoot.setProperty('--o-colour', OUTLINE.colour);
_oRoot.setProperty('--o-text-extrude', BuildExtrudeFilter(_oDepth));
{
	// avatar: a ring plus three offset rings, unioned. box-shadows are all drawn from
	// the element rather than chained, so they keep sub-pixel precision.
	const step = _oDepth * OUTLINE.avScale / 3, dx = OUTLINE.dirX, dy = OUTLINE.dirY;
	const rings = [1, 2, 3].map(k =>
		`${(dx * step * k).toFixed(3)}px ${(dy * step * k).toFixed(3)}px 0 var(--o-hr) ${OUTLINE.colour}`);
	_oRoot.setProperty('--o-avatar-shadow', `0 0 0 var(--o-hr) ${OUTLINE.colour}, ` + rings.join(', '));
}

/* Badges and platform icons are <img>, so no text-shadow and no SVG stroke is
   available. The silhouette is one masked element carrying the icon repeated at
   every offset in (circle ⊕ extrude segment), painted flat, with the real icon on
   top. The offsets never change once the settings are read, so the layer strings
   are built once here rather than per icon. */
const _oIconStyle = (() => {
	const r = _oHr, total = _oDepth * OUTLINE.imgScale;
	const ring = [[0, 0]];
	for (let i = 0; i < OUTLINE.ringPoints; i++) {
		const a = (i / OUTLINE.ringPoints) * Math.PI * 2;
		ring.push([+(Math.cos(a) * r).toFixed(3), +(Math.sin(a) * r).toFixed(3)]);
	}
	const steps = Math.max(1, Math.ceil(total));
	const seg = [];
	for (let k = 0; k <= steps; k++) {
		const t = total * k / steps;
		seg.push([+(OUTLINE.dirX * t).toFixed(3), +(OUTLINE.dirY * t).toFixed(3)]);
	}
	const seen = new Set(), offs = [];
	for (const [ax, ay] of ring) for (const [bx, by] of seg) {
		const x = +(ax + bx).toFixed(3), y = +(ay + by).toFixed(3), key = x + ',' + y;
		if (!seen.has(key)) { seen.add(key); offs.push([x, y]); }
	}
	return {
		offs,
		pad: Math.ceil(r + total + 1),
		position: offs.map(([x, y]) => `calc(50% + ${x}px) calc(50% + ${y}px)`).join(','),
	};
})();

/* Alpha-threshold the mask source.

   mask-composite:add composites as a + b(1-a) per layer, so a pixel with even a
   trace of alpha is driven towards opaque once ~50 layers overlap it: Twitch's
   Prime badge has corner alpha 6/255, and 1 - (1 - 0.024)^52 is about 0.72. The
   union therefore MANUFACTURES a solid corner out of a nearly invisible one, and
   the outline squares off around a badge that looks rounded.

   Kill the faint pixels before they are ever unioned. The ramp keeps a soft edge
   where the artwork genuinely is soft (mid alphas pass through, rescaled) and
   zeroes everything under the low mark, which is the halo that was building up.

   Object URLs, not data URLs: the mask-image list repeats the source once per
   layer, and 52 copies of a base64 PNG would be ~100KB of inline CSS per icon.

   Falls back to the untouched src if the canvas is tainted or the image fails, so
   a CDN without CORS headers degrades to the previous behaviour rather than
   losing its outline. Cached per src — each badge is processed once per session.

   NOTE: this reads pixels, so it needs a second CORS fetch of each badge.
   static-cdn.jtvnw.net sends access-control-allow-origin:*, so it works today. */
const _oMaskCache = new Map();
function ThresholdedMask(src) {
	if (_oMaskCache.has(src)) return _oMaskCache.get(src);
	const job = new Promise(resolve => {
		const im = new Image();
		im.crossOrigin = 'anonymous';
		im.onerror = () => resolve(null);
		im.onload = () => {
			try {
				const c = document.createElement('canvas');
				c.width = im.naturalWidth; c.height = im.naturalHeight;
				const g = c.getContext('2d', { willReadFrequently: false });
				g.drawImage(im, 0, 0);
				const data = g.getImageData(0, 0, c.width, c.height);
				const px = data.data, LO = 90, HI = 190;   // ~0.35 and ~0.75 of 255
				for (let i = 3; i < px.length; i += 4) {
					const a = px[i];
					px[i] = a <= LO ? 0 : a >= HI ? 255 : Math.round(255 * (a - LO) / (HI - LO));
				}
				g.putImageData(data, 0, 0);
				c.toBlob(b => resolve(b ? URL.createObjectURL(b) : null), 'image/png');
			} catch (e) { resolve(null); }        // tainted canvas
		};
		im.src = src;
	});
	_oMaskCache.set(src, job);
	return job;
}

function ApplyIconOutline(img) {
	if (!img || img.dataset.oDone === '1') return;
	const ci = getComputedStyle(img);
	const iw = img.naturalWidth, ih = img.naturalHeight;
	if (!iw || !ih) {                       // not decoded yet — come back on load
		img.addEventListener('load', () => ApplyIconOutline(img), { once: true });
		return;
	}
	img.dataset.oDone = '1';

	let wrap = img.closest('.o-ic');
	if (!wrap) {
		wrap = document.createElement('span');
		wrap.className = 'o-ic';
		img.parentNode.insertBefore(wrap, img);
		wrap.appendChild(document.createElement('span')).className = 'o-ic-sil';
		wrap.appendChild(img);
		// style.css puts the spacing margins and the display mode on the IMG itself
		// (.platform is display:flex + margin-left:7px), so the wrapper has to take
		// both or the icon shifts off its baseline and the silhouette box is wrong.
		wrap.style.margin = `${ci.marginTop} ${ci.marginRight} ${ci.marginBottom} ${ci.marginLeft}`;
		wrap.style.display = ci.display === 'inline' ? 'inline-block' : ci.display;
		wrap.style.verticalAlign = ci.verticalAlign;
		img.style.margin = '0';
	}

	// object-fit:contain leaves very little slack inside the icon's own box, so the
	// silhouette is padded by the full reach and the mask pinned to an explicit size
	// (mask-size:contain would rescale when the box grows). The padded box stays
	// concentric, so 50% still centres where object-fit put the image.
	const bw = parseFloat(ci.width), bh = parseFloat(ci.height);
	const k = Math.min(bw / iw, bh / ih);
	const size = `${(iw * k).toFixed(2)}px ${(ih * k).toFixed(2)}px`;
	const src = img.getAttribute('src');
	const n = _oIconStyle.offs.length;
	const sil = wrap.querySelector('.o-ic-sil');

	const paint = (maskSrc) => {
		const url = `url("${maskSrc}")`;
		sil.style.cssText =
			`position:absolute;inset:${-_oIconStyle.pad}px;pointer-events:none;` +
			`background:${OUTLINE.colour};` +
			`-webkit-mask-image:${Array(n).fill(url).join(',')};mask-image:${Array(n).fill(url).join(',')};` +
			`-webkit-mask-position:${_oIconStyle.position};mask-position:${_oIconStyle.position};` +
			`-webkit-mask-size:${Array(n).fill(size).join(',')};mask-size:${Array(n).fill(size).join(',')};` +
			`-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;` +
			`-webkit-mask-composite:source-over;mask-composite:add;`;
	};

	paint(src);                                   // show something immediately...
	ThresholdedMask(src).then(u => { if (u) paint(u); });   // ...then sharpen the corners
}

// Icons arrive with each message, so outline them as they land.
new MutationObserver(muts => {
	for (const m of muts) for (const node of m.addedNodes) {
		if (node.nodeType !== 1) continue;
		if (node.matches && node.matches('#messageContainer #platform img, #messageContainer #badgeList img'))
			ApplyIconOutline(node);
		if (node.querySelectorAll)
			node.querySelectorAll('#messageContainer #platform img, #messageContainer #badgeList img')
				.forEach(ApplyIconOutline);
	}
// (queried directly: `const messageList` is declared further down this file, so
//  referencing it here would hit the temporal dead zone.)
}).observe(document.getElementById('messageList'), { childList: true, subtree: true });


const mainContainer = document.getElementById('mainContainer');
mainContainer.style.background = hexToRgba(background, backgroundOpacity / 100);

if (showTopGradient) {
	mainContainer.classList.add('show-gradient');
}

const ignoreUserList = ignoreChatters.split(',').map(item => item.trim().toLowerCase());
const messageList = document.getElementById('messageList');

if (scrollDirection === 1) messageList.classList.add('normalScrollDirection');
else if (scrollDirection === 2) messageList.classList.add('reverseScrollDirection');

const client = new StreamerbotClient({
	host: sbServerAddress,
	port: sbServerPort,
	onConnect: () => SetConnectionStatus(true),
	onDisconnect: () => SetConnectionStatus(false),
});

client.on('Twitch.ChatMessage', (data) => TwitchChatMessage(data.data));
client.on('Twitch.ChatMessageDeleted', (data) => TwitchChatMessageDeleted(data.data));
client.on('Twitch.UserBanned', (data) => TwitchUserBanned(data.data));
client.on('Twitch.ChatCleared', (data) => TwitchChatCleared(data.data));
client.on('Twitch.Sub', (data) => TwitchSub(data.data));
client.on('Twitch.ReSub', (data) => TwitchResub(data.data));
client.on('Twitch.GiftSub', (data) => TwitchGiftSub(data.data));
client.on('Twitch.Raid', (data) => TwitchRaid(data.data));
client.on('Twitch.Announcement', (data) => TwitchAnnouncement(data.data));
client.on('Twitch.Follow', (data) => TwitchFollow(data.data));
client.on('Twitch.Cheer', (data) => TwitchCheer(data.data));
client.on('Twitch.AutomaticRewardRedemption', (data) => TwitchAutomaticRewardRedemption(data.data));
client.on('Twitch.RewardRedemption', (data) => TwitchRewardRedemption(data.data));
client.on('Twitch.CustomPowerUpRedemption', (data) => TwitchCustomPowerUpRedemption(data.data));
client.on('Twitch.WatchStreak', (data) => TwitchWatchStreak(data.data));
client.on('Twitch.UserTimedOut', (data) => TwitchUserBanned(data.data));
client.on('Twitch.SharedChatMessageDeleted', (data) => TwitchChatMessageDeleted(data.data));
client.on('Twitch.SharedChatUserBanned', (data) => TwitchUserBanned(data.data));
client.on('Twitch.SharedChatUserTimedout', (data) => TwitchUserBanned(data.data));

client.on('YouTube.Message', (data) => YouTubeMessage(data.data));
client.on('YouTube.SuperChat', (data) => YouTubeSuperChat(data.data));
client.on('YouTube.SuperSticker', (data) => YouTubeSuperSticker(data.data));
client.on('YouTube.NewSponsor', (data) => YouTubeNewSponsor(data.data));
client.on('YouTube.MembershipGift', (data) => YouTubeGiftMembershipReceived(data.data));

client.on('Streamlabs.Donation', (data) => StreamlabsDonation(data.data));
client.on('StreamElements.Tip', (data) => StreamElementsTip(data.data));

client.on('Patreon.PledgeCreated', (data) => PatreonPledgeCreated(data.data));
client.on('Kofi.Donation', (data) => KofiDonation(data.data));
client.on('Kofi.Subscription', (data) => KofiSubscription(data.data));
client.on('Kofi.Resubscription', (data) => KofiResubscription(data.data));
client.on('Kofi.ShopOrder', (data) => KofiShopOrder(data.data));
client.on('TipeeeStream.Donation', (data) => TipeeeStreamDonation(data.data));
client.on('Fourthwall.OrderPlaced', (data) => FourthwallOrderPlaced(data.data));
client.on('Fourthwall.Donation', (data) => FourthwallDonation(data.data));
client.on('Fourthwall.SubscriptionPurchased', (data) => FourthwallSubscriptionPurchased(data.data));
client.on('Fourthwall.GiftPurchase', (data) => FourthwallGiftPurchase(data.data));
client.on('Fourthwall.GiftDrawStarted', (data) => FourthwallGiftDrawStarted(data.data));
client.on('Fourthwall.GiftDrawEnded', (data) => FourthwallGiftDrawEnded(data.data));

client.on('Kick.ChatMessage', (data) => KickChatMessage(data.data));
client.on('Kick.Follow', (data) => KickFollow(data.data));
client.on('Kick.Subscription', (data) => KickSubscription(data.data));
client.on('Kick.GiftedSubscriptions', (data) => KickGiftedSubscriptions(data.data));

const avatarMap = new Map();

// Username / accent color per platform. Used by branded event cards.
const PLATFORM_COLORS = {
	twitch: '#A644FF',
	youtube: '#FF0000',
	kick: '#53FC18',
	tiktok: '#FF0050',
	patreon: '#FF424D',
	kofi: '#13C3FF',
	tipeeeStream: '#E2236F',
	fourthwall: '#1C56F5',
	streamlabs: '#80F5D2',
	streamelements: '#5599FF',
};
function GetPlatformColor(platform) {
	return PLATFORM_COLORS[platform] || '#A644FF';
}
// Platforms that have an icon file in icons/platforms/. Others skip the platform badge.
const PLATFORMS_WITH_ICONS = new Set(['twitch', 'youtube', 'kick', 'tiktok', 'patreon', 'kofi', 'tipeeeStream']);

function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Connected!";
		statusContainer.style.opacity = 1;
		setTimeout(() => {
			statusContainer.style.transition = "all 2s ease";
			statusContainer.style.opacity = 0;
		}, 10);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Connecting...";
		statusContainer.style.transition = "";
		statusContainer.style.opacity = 1;
	}
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Usernames keep their own colour everywhere so cards and chat look identical
// (no background-dependent flipping). We only tame the extremes: a near-white name is
// nudged slightly darker so it stays visible on the white cards, and a near-black name
// is nudged slightly lighter so it stays visible over dark footage. Raise/lower these
// to widen or narrow the "safe" luminance band.
const USERNAME_LUM_MAX = 0.55;         // names brighter than this get darkened down to it
const USERNAME_LUM_MAX_OUTLINE = 0.8;  // gentler cap when the outline is on (less darkening)
const USERNAME_LUM_MIN = 0.04;         // names darker than this get lightened up to it
const USERNAME_LUM_MIN_OUTLINE = 0.10; // higher floor when the outline is on (a bit lighter)
function tameUsernameColor(color, maxLum = USERNAME_LUM_MAX, minLum = USERNAME_LUM_MIN) {
    if (!color || !color.startsWith('#')) return color;
    const parseHex = h => { h = h.replace('#',''); if (h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; };
    const toLinear = c => { const s=c/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); };
    const lum = (r,g,b) => 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);
    const [r,g,b] = parseHex(color);
    const L = lum(r,g,b);
    if (L > maxLum) {
        let f=1.0; while (lum(r*f,g*f,b*f) > maxLum && f>0.05) f-=0.02;
        return `rgb(${Math.round(r*f)}, ${Math.round(g*f)}, ${Math.round(b*f)})`;
    }
    if (L < minLum) {
        let t=0; while (lum(r+(255-r)*t, g+(255-g)*t, b+(255-b)*t) < minLum && t<0.95) t+=0.02;
        return `rgb(${Math.round(r+(255-r)*t)}, ${Math.round(g+(255-g)*t)}, ${Math.round(b+(255-b)*t)})`;
    }
    return color;
}

// Username colour for chat messages. Chat always has the outline now, so it always
// takes the gentler band — a less aggressive bright cap and a higher dark floor,
// because the dark stroke is doing the contrast work. Event cards still call
// tameUsernameColor() with the default (stricter) band, since they sit on solid white.
function usernameChatColor(color) {
    // The outline is always on now, so always use the gentler band: the dark stroke
    // is providing the contrast, so bright names need less darkening and dark names
    // less lightening. (?contrastOutline is still read for backwards compatibility
    // with existing browser-source URLs, but no longer gates anything.)
    return tameUsernameColor(color, USERNAME_LUM_MAX_OUTLINE, USERNAME_LUM_MIN_OUTLINE);
}

// Twitch only puts the chatter's chosen colour on chat messages — event payloads
// (channel point redemptions, cheers, subs, raids, follows...) don't carry it, so the
// bordered cards used to fall back to the platform purple. We remember every colour we
// see go past in chat, keyed by user id / login / display name, and reuse it on that
// user's cards. For someone who hasn't chatted yet we ask ivr.fi once (cached, and it
// just falls back to the platform colour if the lookup fails).
const twitchColorMap = new Map();
const twitchColorFetches = new Map();

function RememberTwitchColor(color, ...keys) {
	if (!color || typeof color !== 'string' || !color.startsWith('#')) return;
	keys.forEach(k => { if (k) twitchColorMap.set(String(k).toLowerCase(), color); });
}

function LookupTwitchColor(...keys) {
	for (const k of keys) {
		if (!k) continue;
		const hit = twitchColorMap.get(String(k).toLowerCase());
		if (hit) return hit;
	}
	return null;
}

function FetchTwitchColor(login) {
	if (twitchColorFetches.has(login)) return twitchColorFetches.get(login);
	const p = fetch('https://api.ivr.fi/v2/twitch/user?login=' + encodeURIComponent(login))
		.then(r => r.ok ? r.json() : null)
		.then(j => {
			const hit = Array.isArray(j) ? j[0] : null;
			const color = hit && hit.chatColor;
			if (color) RememberTwitchColor(color, login, hit.id, hit.displayName);
			return color || null;
		})
		.catch(() => null);
	twitchColorFetches.set(login, p);
	return p;
}

// Colour for a username on an event card: an explicit override wins, then whatever the
// payload carried, then the remembered/looked-up Twitch chat colour, then the platform.
async function EventUserColor(user, platform, override) {
	if (override) return override;
	if (user?.color) return user.color;
	if (platform === 'twitch') {
		const known = LookupTwitchColor(user?.id, user?.login, user?.name, user?.displayName);
		if (known) return known;
		const login = String(user?.login || user?.name || '').toLowerCase();
		if (login && login !== 'anonymous') {
			const fetched = await FetchTwitchColor(login);
			if (fetched) return fetched;
		}
	}
	return GetPlatformColor(platform);
}

async function renderFeaturedMessage(data, headerText, platform) {
	const template = document.getElementById('featuredMessageTemplate');
	if (!template) return;
	const instance = template.content.cloneNode(true);

	instance.querySelector(".featured-header-text").innerText = headerText;
	instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	const usernameSpan = instance.querySelector("#username");
	const featuredColor = platform === 'twitch'
		? await EventUserColor({ ...data.user, color: data.user?.color || data.message?.color }, 'twitch')
		: '#FF0000';
	usernameSpan.replaceWith(usernameMarquee(data.user.name, tameUsernameColor(featuredColor)));

	if (data.user.name !== 'Anonymous') {
		const avatarUrl = await GetAvatar(data.user.name, data.user.profileImageUrl, platform);
		instance.querySelector("#avatar").innerHTML = `<img src="${avatarUrl}" class="avatar">`;

		const platformIcon = platform === 'twitch' ? 'icons/platforms/twitch.png' : 'icons/platforms/youtube.png';
		instance.querySelector("#platform").innerHTML = `<img src="${platformIcon}">`;
	} else {
		instance.querySelector("#avatar").style.display = 'none';
		instance.querySelector("#platform").style.display = 'none';
	}

	let textContent = "";
	if (typeof data.message === 'string') textContent = data.message;
	else if (data.message && typeof data.message.message === 'string') textContent = data.message.message;
	else if (data.text) textContent = data.text;

	const tempDiv = document.createElement('div');
	tempDiv.innerText = textContent;
	let escapedText = tempDiv.innerHTML;
	const platformColor = platform === 'twitch' ? '#A644FF' : '#FF0000';
	escapedText = escapedText.replace(/(^|\s)(@[^\s<]+)/g, `$1<span style="font-weight: bold; color: ${platformColor};">$2</span>`);
	escapedText = linkify(escapedText);

	instance.querySelector(".featured-message-text").innerHTML = escapedText;

	if (data.emotes) {
		data.emotes.forEach(e => {
			instance.querySelector(".featured-message-text").innerHTML = instance.querySelector(".featured-message-text").innerHTML.replace(new RegExp(`\\b${e.name}\\b`, 'g'), `<img src="${e.imageUrl}" class="emote"/>`);
		});
	}

	AddSubCardItem(instance, data.messageId || data.eventId, platform, data.user.id);
}

async function renderEventCard(data, type, platform, opts = {}) {
	const template = document.getElementById('subCardTemplate');
	const instance = template.content.cloneNode(true);

	const avatarDiv = instance.querySelector("#avatar");
	const platformDiv = instance.querySelector("#platform");
	const usernameDiv = instance.querySelector("#username");
	const timestampDiv = instance.querySelector("#timestamp");
	const descDiv = instance.querySelector(".sub-description");
	const iconImg = instance.querySelector(".sub-skull-icon");
	const iconArea = instance.querySelector(".sub-icon-area"); // Grab the invisible spacer box

	// Icon-less event types: remove the image and the invisible spacer entirely
	// (cheer now gets a tier-colored bit-jar icon passed in via opts.icon)
	if (type === 'channelpoint' || type === 'powerup' || type === 'watchstreak') {
		// Completely delete the image and the invisible spacing box from the HTML!
		if (iconImg) iconImg.remove();
		if (iconArea) iconArea.remove();
	} else { 
		// Event type -> [icon file, css class]. New categories use placeholder icons
		// watchstreak has been removed from this map; cheer passes its icon via opts
		const ICON_MAP = {
			raid: ['icons/raid-bell.svg', 'sub-raid-icon'],
			donation: ['icons/donation-paper-bag.svg', 'sub-donation-icon'],
			superchat: ['icons/donation-paper-bag.svg', 'sub-donation-icon'],
			follow: ['icons/follow-heart.svg', 'sub-follow-icon']
		};
		
		const [iconSrc, iconCls] = opts.icon 
			? [opts.icon, opts.iconClass || 'sub-skull-icon'] 
			: (ICON_MAP[type] || ['icons/sub-skull.svg', 'sub-skull-icon']);

		if (iconImg) {
			iconImg.src = iconSrc;
			iconImg.className = iconCls;
		}
	}

	if (showTimestamps) {
		timestampDiv.classList.add("timestamp");
		timestampDiv.innerText = GetCurrentTimeFormatted();
	}

	const isIndividualGift = (type === 'gift' && data.recipient);
	const senderName = data.isAnonymous ? 'Anonymous' : (data.user ? (data.user.name || data.user.displayName) : 'Unknown');
	const receiverName = isIndividualGift ? (data.recipient.name || data.recipient.displayName) : '';

	if (showUsername) {
		usernameDiv.textContent = senderName;
		usernameDiv.style.color = tameUsernameColor(await EventUserColor(data.user, platform, opts.color));
		if (senderName === 'Anonymous') usernameDiv.classList.add('is-anonymous');
	}

	if (showPlatform && senderName !== 'Anonymous' && PLATFORMS_WITH_ICONS.has(platform)) {
		platformDiv.innerHTML = `<img src="icons/platforms/${platform}.png" class="platform"/>`;
		platformDiv.style.display = 'flex';
	} else {
		platformDiv.style.display = 'none';
	}

	if (showAvatar && senderName !== 'Anonymous') {
		const avatarURL = await GetAvatar(senderName, data.user?.profileImageUrl, platform);
		avatarDiv.innerHTML = `<img src="${avatarURL}" class="avatar">`;
		avatarDiv.style.display = 'flex';
	} else {
		avatarDiv.style.display = 'none';
	}
	
	if (isIndividualGift) {
		const subUserContent = instance.querySelector(".sub-user-content");
		const receiverSpan = instance.querySelector("#gift-receiver");
		if (receiverSpan) {
			subUserContent.classList.add('is-gift');
			receiverSpan.style.display = 'flex';
			const recAvatarDiv = instance.querySelector("#receiver-avatar");
			if (showAvatar) {
				const recAvatarURL = await GetAvatar(receiverName, data.recipient?.profileImageUrl, platform);
				recAvatarDiv.innerHTML = `<img src="${recAvatarURL}" class="avatar">`;
			}
			if (showPlatform) instance.querySelector("#receiver-platform").innerHTML = `<img src="icons/platforms/${platform}.png" class="platform"/>`;

			// Sender + receiver names become scrolling marquees that split the row's
			// width by max-min fairness (allocateGiftRow), replacing the old ellipsis.
			const senderColor = tameUsernameColor(await EventUserColor(data.user, platform, opts.color));
			const receiverColor = tameUsernameColor(await EventUserColor(data.recipient, platform, opts.color));
			const senderText = showUsername ? senderName : '';

			// Wrap the sender's avatar · platform · name into one flex cell.
			const giftSender = document.createElement('div');
			giftSender.className = 'gift-sender';
			giftSender.append(avatarDiv, platformDiv);
			giftSender.insertAdjacentHTML('beforeend', marqueeHTML(senderText, { mode: 'fadeswap', fade: true, cls: 'gift-name' }));
			giftSender.querySelector('.mq').style.color = senderColor;
			subUserContent.insertBefore(giftSender, receiverSpan);
			usernameDiv.remove();

			// Receiver name marquee replaces the #receiver-username span.
			const recUsernameDiv = instance.querySelector("#receiver-username");
			recUsernameDiv.insertAdjacentHTML('beforebegin', marqueeHTML(receiverName, { mode: 'fadeswap', fade: true, cls: 'gift-name' }));
			recUsernameDiv.previousElementSibling.style.color = receiverColor;
			recUsernameDiv.remove();
		}
	} else if (showUsername) {
		// Non-gift event cards: the single sender username also fade-scrolls
		// instead of truncating with "…".
		usernameDiv.replaceWith(usernameMarquee(senderName, usernameDiv.style.color));
	}

	// opts.description (may contain HTML) overrides the built-in text for a type.
	let description = opts.description || '';
	if (!opts.description) {
		switch(type) {
			case 'sub':
				description = data.is_prime || data.isPrime ? `Used Their Prime Sub` : `Subscribed With Tier ${String(data.sub_tier || data.subTier || '1').charAt(0)}`;
				break;
			case 'resub':
				const months = data.cumulativeMonths || '14';
				description = data.isPrime ? `Used Their Prime Sub {calendar} ${months} Months` : `Resubscribed With Tier ${String(data.subTier || '1').charAt(0)} {calendar} ${months} Months`;
				break;
			case 'gift':
				description = platform === 'twitch' ? `Gifted a Tier ${String(data.subTier || '1').charAt(0)} Subscription` : `Gifted a Channel Membership`;
				break;
			case 'giftbomb':
				description = platform === 'twitch' ? `Gifted ${data.giftCount} Tier ${String(data.subTier || '1').charAt(0)} Subs to the Community` : `Gifted ${data.giftCount} Memberships to the Community`;
				break;
			case 'member':
				description = `Became a Channel Member!`;
				break;
			case 'raid':
				description = `Raiding with a Party of ${data.viewers} ${data.viewers === 1 ? 'Homie' : 'Homies'}`;
				break;
			case 'donation':
				description = `Donated ${data.formattedAmount}`;
				break;
			case 'superchat':
				description = `Donated ${data.amount} Through Super Chat`;
				break;
			case 'follow':
				description = `Followed`;
				break;
			case 'cheer':
				description = `Cheered ${data.bits} Bits`;
				break;
			case 'watchstreak':
				description = `On a ${data.streakCount} Stream Streak!`;
				break;
		}
	}

	const calendarImg = `<img src="icons/calendar.svg" class="sub-calendar-icon">`;
	descDiv.innerHTML = description.replace('{calendar}', calendarImg);

	const commentWrapper = instance.querySelector(".sub-comment-wrapper");
	const message = data.text || (typeof data.message === 'string' ? data.message : '');
	let hasComment = false;

	if (opts.htmlContent) {
		commentWrapper.style.display = "block";
		const commentTextEl = instance.querySelector(".sub-comment-text");
		commentTextEl.innerHTML = opts.htmlContent;
		// Song-request cards get slightly wider right padding (see .is-song-request in CSS).
		if (/music-ui-container/.test(opts.htmlContent)) {
			commentWrapper.querySelector(".sub-comment-content")?.classList.add("is-song-request");
		}
		hasComment = true;
	} else if (message && message.trim().length > 0) {
		commentWrapper.style.display = "block";
		const commentTextEl = instance.querySelector(".sub-comment-text");
		commentTextEl.innerHTML = linkify(escapeHtml(message));
		hasComment = true;
	}

	// Event cards with a comment attached trim the header's bottom padding so it sits
	// tighter against the comment below (cheers, power-ups, channel points, etc.).
	// Subs/resubs are excluded — they keep the balanced 12px.
	if (hasComment && type !== 'sub' && type !== 'resub') {
		instance.querySelector('.sub-card-content')?.classList.add('has-comment');
	}

	AddSubCardItem(instance, data.messageId || data.eventId, platform, data.user?.id);
}

async function TwitchChatMessage(data) {
	// Learn this chatter's colour before any early return, so event cards for people
	// whose messages we hide (commands, ignored users) still get the right colour.
	RememberTwitchColor(data.message?.color, data.message?.userId, data.message?.username, data.message?.displayName, data.user?.id, data.user?.login, data.user?.name);
	if (data.message?.firstMessage) return await renderFeaturedMessage(data, "FIRST TIME CHAT", 'twitch');
	if (!showTwitchMessages || (data.message.message.startsWith("!") && excludeCommands) || ignoreUserList.includes(data.message.username)) return;

	const template = document.getElementById('messageTemplate');
	const instance = template.content.cloneNode(true);

	const replyDiv = instance.querySelector("#reply");
	if (data.message.isReply && showMessage) {
		replyDiv.style.display = 'flex';
		const replyUserDiv = instance.querySelector("#replyUser");
		replyUserDiv.innerText = data.message.reply.userName;
		replyUserDiv.style.color = usernameChatColor('#A644FF');
		instance.querySelector("#replyMsg").innerText = data.message.reply.msgBody;
	} else if (replyDiv) {
		replyDiv.remove();
	}

	if (showTimestamps) instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	if (showUsername) {
		// Same fade-scroll window the event cards use — a long display name is
		// cropped and scrolled instead of running off the row and shoving the
		// timestamp out of view.
		const usernameDiv = instance.querySelector("#username");
		usernameDiv.replaceWith(usernameMarquee(data.message.displayName, usernameChatColor(data.message.color)));
	}

	const messageDiv = instance.querySelector("#message");
	if (showMessage) {
		messageDiv.innerText = data.message.message;
		messageDiv.innerHTML = messageDiv.innerHTML.replace(/(^|\s)(@[^\s<]+)/g, `$1<span style="font-weight: bold; color: #A644FF;">$2</span>`);
		messageDiv.innerHTML = linkify(messageDiv.innerHTML);
	}
	if (data.message.isMe) messageDiv.style.color = data.message.color;

	if (showPlatform) instance.querySelector("#platform").innerHTML = `<img src="icons/platforms/twitch.png" class="platform"/>`;

	if (showBadges) {
		const badgeListDiv = instance.querySelector("#badgeList");
		badgeListDiv.innerHTML = "";
		data.message.badges.forEach(b => {
			const badge = new Image(); badge.src = b.imageUrl; badge.classList.add("badge");
			badgeListDiv.appendChild(badge);
		});
	}

	data.emotes.forEach(e => {
		messageDiv.innerHTML = messageDiv.innerHTML.replace(new RegExp(`\\b${e.name}\\b`, 'g'), `<img src="${e.imageUrl}" class="emote"/>`);
	});

	if (data.cheerEmotes) {
		data.cheerEmotes.forEach(e => {
			const bitsElements = `<span class="bits">${e.bits}</span>`;
			messageDiv.innerHTML = messageDiv.innerHTML.replace(new RegExp(`\\b${e.name}${e.bits}\\b`, 'ig'), `<img src="${e.imageUrl}" class="emote"/>` + bitsElements);
		});
	}

	if (showAvatar) {
		const avatarURL = await GetAvatar(data.message.username, null, 'twitch');
		instance.querySelector("#avatar").innerHTML = `<img src="${avatarURL}" class="avatar">`;
	}

	const messageText = data.message.message;
	if (IsThisUserAllowedToPostImagesOrNotReturnTrueIfTheyCanReturnFalseIfTheyCannot(imageEmbedPermissionLevel, data, 'twitch') && IsImageUrl(messageText)) {
		const image = new Image();
		image.onload = function () {
			image.style.padding = "10px 0px";
			image.style.width = "100%";
			image.style.display = "block";
			messageDiv.innerHTML = '';
			messageDiv.appendChild(image);
			AddMessageItem(instance, data.message.msgId, 'twitch', data.user.id);
		};
		try {
			const urlObj = new URL(messageText);
			urlObj.search = '';
			urlObj.hash = '';
			image.src = "https://external-content.duckduckgo.com/iu/?u=" + encodeURIComponent(urlObj.toString());
		} catch (e) {
			AddMessageItem(instance, data.message.msgId, 'twitch', data.user.id);
		}
	} else {
		AddMessageItem(instance, data.message.msgId, 'twitch', data.user.id);
	}
}

/* =========================================================================
   Stinger sync (see also the stinger project's script.js)
   -------------------------------------------------------------------------
   The stinger is a SEPARATE OBS browser source layered above this chat. OBS
   isolates browser sources, so the two can't message each other — instead they
   both subscribe to the same Streamer.bot events and run their halves of ONE
   shared, fixed timeline. Because both receive the same event at the same
   instant, they stay in lockstep with no cross-source messaging.

   On a triggering event this source: fades the chat out, holds the alert card,
   waits out the stinger, fades the chat back in, then renders the held card.

   The hidden window is NOT fixed — stingerContentMs() computes how long the
   stinger actually needs for this event (a cheer's tip-jar length depends on how
   many gems the bit amount throws; a sub is its frame-sequence length). The
   stinger project computes the exact same number from the same event, so the two
   stay in lockstep without messaging each other.

   IMPORTANT: STINGER_SYNC + stingerContentMs/stingerCheerThrows must stay identical
   to the copies in the stinger's script.js. If you change these, change both.
   ========================================================================= */
const STINGER_SYNC = {
  chatFadeMs:     350,  // chat fade out / fade in (matches #mainContainer transition in style.css)
  // --- tip-jar timing model, mirrors the stinger's CFG so we can predict a cheer's length ---
  fps:            25,
  jarIntroFrames: 36,   // the jar-rise intro
  throwStaggerMs: 170,  // gap between queued gem throws
  throwFlightMs:  780,  // a gem's flight time
  noteTailMs:     850,  // the last note lingers after the last gem lands
  jarIdleMs:      800,  // the jar/sub holds this long before it starts fading out
  maxThrows:      40,   // the jar clamps a cheer to this many throws
  subFrames:      65,   // sub-stinger frame count
  marginMs:       250,  // small pad so the chat's card lands as the stinger clears, not before
};

// mirrors CFG.bitTiers decomposition in the stinger — how many gems a cheer throws
function stingerCheerThrows(bits) {
  const mins = [10000, 5000, 1000, 100, 10];
  let rest = Math.max(0, Math.floor(bits) || 0), n = 0;
  for (const m of mins) { const c = Math.floor(rest / m); if (c > 0) { rest -= c * m; n += c; } }
  if (n === 0) n = 1;
  return Math.min(n, STINGER_SYNC.maxThrows);
}

// Predicted on-screen time (ms) the stinger runs for an event — identical to the
// stinger's copy so the chat fades back in as the stinger clears.
function stingerContentMs(kind, data) {
  const S = STINGER_SYNC;
  if (kind === 'cheer') {
    const n = stingerCheerThrows(data && data.bits);
    const introMs  = S.jarIntroFrames / S.fps * 1000;
    const throwsMs = (n - 1) * S.throwStaggerMs + S.throwFlightMs;
    return Math.round(introMs + throwsMs + S.noteTailMs + S.jarIdleMs + S.marginMs);
  }
  return Math.round(S.subFrames / S.fps * 1000 + S.jarIdleMs + S.marginMs);
}

let stingerCycleEndAt = 0;   // performance.now() when the held cards are released
let stingerPendingCards = []; // card render thunks waiting for the chat to come back

function startStingerCycle(contentMs) {
  const S = STINGER_SYNC, now = performance.now();
  const hiddenBeforeFadeIn = S.chatFadeMs + contentMs;   // chat hidden until the stinger fades out
  stingerCycleEndAt = now + hiddenBeforeFadeIn + S.chatFadeMs;
  mainContainer.classList.add('stinger-hidden');                         // fade chat out
  setTimeout(() => mainContainer.classList.remove('stinger-hidden'),     // fade chat back in
             hiddenBeforeFadeIn);
  setTimeout(() => {                                                     // chat is back -> show held cards
    const cards = stingerPendingCards; stingerPendingCards = [];
    cards.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    if (stingerPendingCards.length && performance.now() >= stingerCycleEndAt) startStingerCycle(stingerContentMs('sub'));
  }, hiddenBeforeFadeIn + S.chatFadeMs);
}

// Call on the RAW triggering event (before any gift-bomb accumulation) so the chat
// fade lines up with the stinger, which fires on the same event. kind is 'cheer' or
// 'sub'; data carries the bit amount (cheer) and the user (avatar pre-warm). Bursts
// collapse into the one active cycle. Pre-warming the avatar during the hidden window
// lets the held card pop in tight to the chat's return instead of waiting on a fetch.
function stingerTrigger(kind, data) {
  if (!stingersEnabled) return;
  const user = data && data.user;
  if (user && user.name) GetAvatar(user.name, user.profileImageUrl, 'twitch');
  if (performance.now() >= stingerCycleEndAt) startStingerCycle(stingerContentMs(kind, data));
}

// Wrap the actual card render. When a cycle is active the card is held until the
// chat fades back in; otherwise (stingers off, or the rare event that lands after
// the window) it renders immediately, so behaviour is unchanged when disabled.
function stingerGateCard(thunk) {
  if (!stingersEnabled) return thunk();
  if (performance.now() < stingerCycleEndAt) stingerPendingCards.push(thunk);
  else thunk();
}

async function TwitchSub(data) { if (!showTwitchSubs) return; stingerTrigger('sub', data); stingerGateCard(() => renderEventCard(data, 'sub', 'twitch')); }
async function TwitchResub(data) { if (!showTwitchSubs) return; stingerTrigger('sub', data); stingerGateCard(() => renderEventCard(data, 'resub', 'twitch')); }
async function TwitchRaid(data) {
	if (!showTwitchRaids) return;
	if (!data.user) data.user = { id: data.from_broadcaster_user_id, name: data.from_broadcaster_user_name, login: data.from_broadcaster_user_login };
	await renderEventCard(data, 'raid', 'twitch');
}
async function TwitchAnnouncement(data) { if (showTwitchAnnouncements) await renderFeaturedMessage(data, "ANNOUNCEMENT", 'twitch'); }
async function TwitchAutomaticRewardRedemption(data) {
	if (data.reward_type !== 'gigantify_an_emote') return;

	const template = document.getElementById('messageTemplate');
	if (!template) return;
	
	const instance = template.content.cloneNode(true);
	const userInfoDiv = instance.querySelector("#userInfo");
	const messageDiv = instance.querySelector("#message");

	if (userInfoDiv) userInfoDiv.style.display = "none";

	const gigaEmote = data.gigantified_emote?.imageUrl || data.gigantified_emote?.url;
	if (!gigaEmote) return;

	const image = new Image();
	image.src = gigaEmote;
	image.style.padding = "10px 0px";
	image.style.width = "50%";
	image.style.display = "block";
	image.style.margin = "0 auto"; 

	image.onload = function () {
		messageDiv.innerHTML = '';
		messageDiv.appendChild(image);
		const userId = data.user_id || data.user?.id || 'reward_user';
		AddMessageItem(instance, data.id, 'twitch', userId);
	};
}

// ===== Compact single-row alert (boiling border). Shared by follows + YT subscribe. =====
// `action` is the bold verb shown after the username ("followed", "subscribed", ...).
async function renderFollowCard(data, platform, action = 'followed') {
	const template = document.getElementById('followCardTemplate');
	const instance = template.content.cloneNode(true);

	const avatarDiv = instance.querySelector("#avatar");
	const platformDiv = instance.querySelector("#platform");
	const usernameDiv = instance.querySelector("#username");
	const timestampDiv = instance.querySelector("#timestamp");
	const actionDiv = instance.querySelector(".follow-action");

	if (actionDiv) actionDiv.innerText = action;

	const name = data.user?.name || 'Someone';

	if (showUsername) {
		usernameDiv.replaceWith(usernameMarquee(name, tameUsernameColor(await EventUserColor(data.user, platform))));
	}

	if (showPlatform && PLATFORMS_WITH_ICONS.has(platform)) {
		platformDiv.innerHTML = `<img src="icons/platforms/${platform}.png" class="platform"/>`;
	} else {
		platformDiv.style.display = 'none';
	}

	if (showAvatar) {
		const avatarURL = await GetAvatar(name, data.user?.profileImageUrl, platform);
		avatarDiv.innerHTML = `<img src="${avatarURL}" class="avatar">`;
	} else {
		avatarDiv.style.display = 'none';
	}

	if (showTimestamps) {
		timestampDiv.classList.add("timestamp");
		timestampDiv.innerText = GetCurrentTimeFormatted();
	}

	AddSubCardItem(instance, data.user?.id || `follow-${Date.now()}`, platform, data.user?.id);
}

// ===== New follower (Twitch) =====
async function TwitchFollow(data) {
	if (!showTwitchFollows) return;
	const user = { id: data.user_id, name: data.user_name, login: data.user_login };
	await renderFollowCard({ ...data, user }, 'twitch');
}

// ===== Cheer / Bits (dedicated branded card) =====
async function TwitchCheer(data) {
	if (!showTwitchCheers) return;
	stingerTrigger('cheer', data);
	const rawText = typeof data.message === 'string' ? data.message : (data.message?.message || '');
	// Strip only identified cheermote tokens (e.g. "Cheer100") using the same
	// cheerEmotes array Streamer.bot provides, leaving the actual typed message.
	let text = rawText;
	if (data.cheerEmotes && data.cheerEmotes.length > 0) {
		data.cheerEmotes.forEach(e => {
			text = text.replace(new RegExp(`\\b${e.name}${e.bits}\\b`, 'ig'), '');
		});
	}
	text = text.trim();

	// Pick the bit gem color based on cheer amount (local bit-<color>.svg icons).
	// Twitch tiers: 1-99 gray, 100-999 purple, 1000-4999 green, 5000-9999 blue, 10000+ red.
	const bits = data.bits || 0;
	let bitColor;
	if      (bits >= 10000) bitColor = 'red';
	else if (bits >= 5000)  bitColor = 'blue';
	else if (bits >= 1000)  bitColor = 'green';
	else if (bits >= 100)   bitColor = 'purple';
	else                    bitColor = 'gray';

	const bitIcon = `<img src="icons/bit-${bitColor}.svg" class="sub-bit-gem-icon">`;

	const description = `Cheered ${data.bits}${bitIcon}`;
	// Tier-colored bit-jar card icon, matching the gem color picked above.
	stingerGateCard(() => renderEventCard({ user: data.user, bits: data.bits, text }, 'cheer', 'twitch', {
		description,
		icon: `icons/bit-jar-${bitColor}.svg`,
		iconClass: 'sub-bit-jar-icon',
	}));
}
const _outlineCache = new Map();
function makeOutlinedIcon(srcUrl, outlinePx = 5, outlineColor = '#000') {
	const cacheKey = `${srcUrl}|${outlinePx}|${outlineColor}`;
	if (_outlineCache.has(cacheKey)) return _outlineCache.get(cacheKey);
	const p = new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const w = img.naturalWidth, h = img.naturalHeight, pad = outlinePx + 2;
			const cw = w + pad * 2, ch = h + pad * 2;
			// 1) colored silhouette of the source
			const sil = document.createElement('canvas');
			sil.width = cw; sil.height = ch;
			const sx = sil.getContext('2d');
			sx.drawImage(img, pad, pad, w, h);
			sx.globalCompositeOperation = 'source-in';
			sx.fillStyle = outlineColor;
			sx.fillRect(0, 0, cw, ch);
			// 2) stamp silhouette in a full ring of offsets to dilate -> hard outline
			const out = document.createElement('canvas');
			out.width = cw; out.height = ch;
			const ox = out.getContext('2d');
			for (let a = 0; a < 360; a += 12) {
				ox.drawImage(sil, Math.round(Math.cos(a * Math.PI / 180) * outlinePx),
				                  Math.round(Math.sin(a * Math.PI / 180) * outlinePx));
			}
			// 3) original art on top
			ox.drawImage(img, pad, pad, w, h);
			resolve(out.toDataURL());
		};
		img.onerror = () => resolve(srcUrl); // fall back to raw image if it fails
		img.src = srcUrl;
	});
	_outlineCache.set(cacheKey, p);
	return p;
}

async function TwitchRewardRedemption(data) {
	if (!showTwitchChannelPoints) return;
	const user = { id: data.user_id, name: data.user_name, login: data.user_login };

	let rewardImageUrl = "https://static-cdn.jtvnw.net/custom-reward-images/default-2.png";

	if (data.reward && data.reward.image && data.reward.image.url_2x) {
		rewardImageUrl = data.reward.image.url_2x;
	} else if (data.reward && data.reward.defaultImage && data.reward.defaultImage.url_2x) {
		rewardImageUrl = data.reward.defaultImage.url_2x;
	}

	const outlinedUrl = await makeOutlinedIcon(rewardImageUrl, 5);
	const cpIcon = `<img src="${outlinedUrl}" class="sub-inline-icon" style="filter: none; height: 1.6em; width: auto; margin: 0 4px; vertical-align: -0.45em;">`;

	const description = `Redeemed ${escapeHtml(data.reward.title)}${cpIcon}${data.reward.cost}`;
	let text = data.user_input || '';
	let htmlContent = null;

	if (data.reward && data.reward.title && data.reward.title.toLowerCase().includes("song request")) {
		const songInfo = await GetSongInfo(text);
		if (songInfo) {
			// Fallback transparent pixel if no art is found so the layout doesn't break
			const artUrl = songInfo.albumArt || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

			// Title / album / artist scroll (Apple-smooth wrap) instead of ellipsis-
			// truncating, ported from collage.html's song-request card.
			htmlContent = `
				<div class="music-ui-container">
					<img class="music-ui-art" src="${artUrl}" onerror="this.style.display='none'" />
					<div class="music-ui-info">
						${marqueeHTML(songInfo.title, { mode: 'smooth', fade: true, cls: 'music-ui-title' })}
						${songInfo.album ? marqueeHTML(songInfo.album, { mode: 'smooth', fade: true, cls: 'music-ui-album' }) : ''}
						<div class="music-ui-artist-row">
							${marqueeHTML(songInfo.artist, { mode: 'smooth', fade: true, cls: 'music-ui-artist' })}
							<span class="music-ui-duration">
								<img src="icons/icon-clock.svg" class="music-ui-clock" />
								${FormatSongDuration(songInfo.durationMs)}
							</span>
						</div>
					</div>
				</div>
			`;
		}
	}

	await renderEventCard({ ...data, user, text }, 'channelpoint', 'twitch', { description, htmlContent });
}

// ===== Custom Power-Up (bits) =====
async function TwitchCustomPowerUpRedemption(data) {
	if (!showTwitchPowerUps) return;
	const bitIcon = `<img src="icons/badges/twitch-bit.svg" class="sub-inline-icon">`;
	const description = `Redeemed ${escapeHtml(data.customPowerUp.title)} ${bitIcon} ${data.customPowerUp.bits}`;
	await renderEventCard({ ...data, text: data.userInput || '' }, 'powerup', 'twitch', { description });
}

// ===== Watch streak =====
async function TwitchWatchStreak(data) {
	if (!showTwitchWatchStreaks) return;
	const streakCount = data.watchStreak ?? data.streak_count;
	const name = data.displayName ?? data.user?.name;
	const user = data.user || { name: name, login: name };
	await renderEventCard({ ...data, user, streakCount }, 'watchstreak', 'twitch');
}

const GIFT_BOMB_WINDOW_MS = 800;
const giftBombBuffer = new Map();

function accumulateGift(data, platform) {
	const senderId = data.isAnonymous ? '__anonymous__' : (data.user ? (data.user.id || data.user.login || data.user.name) : '__unknown__');
	const key = `${platform}:${senderId}`;

	if (giftBombBuffer.has(key)) {
		const entry = giftBombBuffer.get(key);
		entry.count++;
		clearTimeout(entry.timer);
		entry.timer = setTimeout(() => flushGiftBomb(key), GIFT_BOMB_WINDOW_MS);
	} else {
		giftBombBuffer.set(key, { data, platform, count: 1, timer: setTimeout(() => flushGiftBomb(key), GIFT_BOMB_WINDOW_MS) });
	}
}

function flushGiftBomb(key) {
	const entry = giftBombBuffer.get(key);
	if (!entry) return;
	giftBombBuffer.delete(key);
	const { data, platform, count } = entry;

	// Only Twitch gifts drive the stinger; other platforms render immediately.
	const gate = (platform === 'twitch') ? stingerGateCard : (fn => fn());
	if (count === 1) gate(() => renderEventCard(data, 'gift', platform));
	else gate(() => renderEventCard({ ...data, giftCount: count, recipient: null, messageId: `giftbomb-${Date.now()}` }, 'giftbomb', platform));
}

async function TwitchGiftSub(data) { if (!showTwitchSubs) return; stingerTrigger('sub', data); accumulateGift(data, 'twitch'); }

function TwitchChatMessageDeleted(data) {
	document.querySelectorAll(`li[id="${data.messageId}"]`).forEach(item => {
		item.style.opacity = 0; 
		item.style.height = 0;
		item.style.paddingTop = 0;
		item.style.paddingBottom = 0;
		item.style.marginTop = 0;
		item.style.marginBottom = 0;
		setTimeout(() => item.remove(), 400);
	});
}
function TwitchUserBanned(data) {
	document.querySelectorAll(`li[data-user-id="${data.user_id}"]`).forEach(item => item.remove());
}
function TwitchChatCleared() {
	document.getElementById("messageList").innerHTML = '';
}

async function YouTubeMessage(data) {
	if (data.isFirstMessage || data.message?.firstMessage) return await renderFeaturedMessage(data, "FIRST TIME CHAT", 'youtube');
	if (!showYouTubeMessages || (data.message.startsWith("!") && excludeCommands) || ignoreUserList.includes(data.user.name)) return;

	const template = document.getElementById('messageTemplate');
	const instance = template.content.cloneNode(true);

	const replyDiv = instance.querySelector("#reply");
	if (replyDiv) replyDiv.remove();

	if (showTimestamps) instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	if (showUsername) {
		const usernameDiv = instance.querySelector("#username");
		usernameDiv.replaceWith(usernameMarquee(data.user.name, usernameChatColor('#f70000')));
	}

	const messageDiv = instance.querySelector("#message");
	if (showMessage) {
		messageDiv.innerText = data.message;
		messageDiv.innerHTML = messageDiv.innerHTML.replace(/(^|\s)(@[^\s<]+)/g, `$1<span style="font-weight: bold; color: #FF0000;">$2</span>`);
		messageDiv.innerHTML = linkify(messageDiv.innerHTML);
	}

	if (showPlatform) instance.querySelector("#platform").innerHTML = `<img src="icons/platforms/youtube.png" class="platform"/>`;

	if (showBadges) {
		const badgeListDiv = instance.querySelector("#badgeList");
		badgeListDiv.innerHTML = ""; 
		const addBadge = (icon, invert = true) => { const b = new Image(); b.src = `icons/badges/${icon}`; if (invert) b.style.filter = `invert(100%)`; b.classList.add("badge"); badgeListDiv.appendChild(b); };
		// Broadcaster uses Twitch's own badge art (already coloured, so no invert).
		if (data.user.isOwner) addBadge('twitch-broadcaster.png', false);
		if (data.user.isModerator) addBadge('youtube-moderator.svg');
		if (data.user.isSponsor) addBadge('youtube-member.svg');
		if (data.user.isVerified) addBadge('youtube-verified.svg');
	}

	data.emotes.forEach(e => { messageDiv.innerHTML = messageDiv.innerHTML.replace(new RegExp(e.name, 'g'), `<img src="${e.imageUrl}" class="emote"/>`); });

	if (showAvatar) {
		const avatarURL = await GetAvatar(data.user.name, data.user.profileImageUrl, 'youtube');
		instance.querySelector("#avatar").innerHTML = `<img src="${avatarURL}" class="avatar">`;
	}

	const messageText = data.message;
	if (IsThisUserAllowedToPostImagesOrNotReturnTrueIfTheyCanReturnFalseIfTheyCannot(imageEmbedPermissionLevel, data, 'youtube') && IsImageUrl(messageText)) {
		const image = new Image();
		image.onload = function () {
			image.style.padding = "10px 0px";
			image.style.width = "100%";
			image.style.display = "block";
			messageDiv.innerHTML = '';
			messageDiv.appendChild(image);
			AddMessageItem(instance, data.eventId, 'youtube', data.user.id);
		};
		try {
			const urlObj = new URL(messageText);
			urlObj.search = '';
			urlObj.hash = '';
			image.src = "https://external-content.duckduckgo.com/iu/?u=" + encodeURIComponent(urlObj.toString());
		} catch (e) {
			AddMessageItem(instance, data.eventId, 'youtube', data.user.id);
		}
	} else {
		AddMessageItem(instance, data.eventId, 'youtube', data.user.id);
	}
}

async function YouTubeSuperChat(data) {
	if (!showYouTubeSuperChats) return;
	if (!data.user) data.user = { id: data.eventId || 'yt-user', name: data.user ? data.user.name : 'YouTube Fan' };
	await renderEventCard(data, 'superchat', 'youtube');
}
function YouTubeSuperSticker(data) {
	if (!showYouTubeSuperStickers) return;
	const template = document.getElementById('cardTemplate').content.cloneNode(true);
	const cardDiv = template.querySelector("#card");
	cardDiv.classList.add('youtube');
	
	const stickerInstance = document.getElementById('stickerTemplate').content.cloneNode(true);
	stickerInstance.querySelector("#stickerImg").src = FindFirstImageUrl(data);
	stickerInstance.querySelector("#stickerLabel").innerText = `${data.user.name} sent a Super Sticker (${data.amount})`;
	template.querySelector("#content").appendChild(stickerInstance);
	AddMessageItem(template, data.eventId, 'youtube', data.user.id);
}
async function YouTubeNewSponsor(data) {
	if (!showYouTubeMemberships) return;
	await renderFollowCard(data, 'youtube', 'subscribed');
}
async function YouTubeGiftMembershipReceived(data) {
	if (!showYouTubeMemberships) return;
	accumulateGift({ ...data, user: data.gifter || data.user, recipient: data.recipient || data.user, subTier: data.tier || '1' }, 'youtube');
}

async function StreamlabsDonation(data) {
	if (!showStreamlabsDonations) return;
	if (!data.user) data.user = { id: data.from, name: data.from };
	await renderEventCard(data, 'donation', 'twitch');
}
async function StreamElementsTip(data) {
	if (!showStreamElementsTips) return;
	if (!data.user) data.user = { id: data.username, name: data.username };
	if (!data.formattedAmount) data.formattedAmount = `$${data.amount}`;
	await renderEventCard(data, 'donation', 'twitch');
}

// ============================================================
//  Membership / donation platforms (branded via renderEventCard)
// ============================================================

function MoneyText(amount, currency) {
	if (amount == null || Number(amount) === 0) return '';
	return currency === 'USD' ? `$${amount}` : `${currency} ${amount}`;
}

// ----- Patreon -----
function PatreonPledgeCreated(data) {
	if (!showPatreon) return;
	const amount = (data.attributes.will_pay_amount_cents / 100).toFixed(2);
	renderEventCard({ ...data, user: { name: data.attributes.full_name } }, 'member', 'patreon', { description: `Joined Patreon ($${amount})` });
}

// ----- Ko-fi -----
function KofiDonation(data) {
	if (!showKofi) return;
	renderEventCard({ ...data, user: { name: data.from } }, 'donation', 'kofi', { description: `Donated ${MoneyText(data.amount, data.currency)}` });
}
function KofiSubscription(data) {
	if (!showKofi) return;
	renderEventCard({ ...data, user: { name: data.from } }, 'member', 'kofi', { description: `Subscribed (${MoneyText(data.amount, data.currency)})` });
}
function KofiResubscription(data) {
	if (!showKofi) return;
	renderEventCard({ ...data, user: { name: data.from } }, 'member', 'kofi', { description: `Subscribed (${data.tier})` });
}
function KofiShopOrder(data) {
	if (!showKofi) return;
	const items = data.items ? data.items.length : 0;
	const money = MoneyText(data.amount, data.currency);
	renderEventCard({ ...data, user: { name: data.from } }, 'donation', 'kofi', { description: `Ordered ${items} item(s) on Ko-fi${money ? ` (${money})` : ''}` });
}

// ----- TipeeeStream -----
function TipeeeStreamDonation(data) {
	if (!showTipeeeStream) return;
	renderEventCard({ ...data, user: { name: data.username } }, 'donation', 'tipeeeStream', { description: `Donated ${MoneyText(data.amount, data.currency)}` });
}

// ----- Fourthwall -----
function FourthwallMoney(amount, currency) {
	const m = MoneyText(amount, currency);
	return m ? ` (${m})` : '';
}
function FourthwallOrderPlaced(data) {
	if (!showFourthwall) return;
	const item = data.variants?.[0]?.name || 'an item';
	const extra = (data.variants?.length || 1) > 1 ? ` and ${data.variants.length - 1} other item(s)` : '';
	renderEventCard({ ...data, user: { name: data.username || 'Someone' } }, 'donation', 'fourthwall', { description: `Ordered ${escapeHtml(item)}${extra}${FourthwallMoney(data.total, data.currency)}` });
}
function FourthwallDonation(data) {
	if (!showFourthwall) return;
	renderEventCard({ ...data, user: { name: data.username || 'Someone' } }, 'donation', 'fourthwall', { description: `Donated ${MoneyText(data.amount, data.currency)}` });
}
function FourthwallSubscriptionPurchased(data) {
	if (!showFourthwall) return;
	renderEventCard({ ...data, user: { name: data.nickname || 'Someone' } }, 'member', 'fourthwall', { description: `Subscribed${FourthwallMoney(data.amount, data.currency)}` });
}
function FourthwallGiftPurchase(data) {
	if (!showFourthwall) return;
	const gifts = data.gifts?.length || 1;
	const itemName = data.offer?.name || 'an item';
	const qty = gifts > 1 ? `${gifts} x ` : '';
	renderEventCard({ ...data, user: { name: 'Someone' } }, 'donation', 'fourthwall', { description: `Gifted ${qty}${escapeHtml(itemName)}${FourthwallMoney(data.total, data.currency)}` });
}
function FourthwallGiftDrawStarted(data) {
	if (!showFourthwall) return;
	const itemName = data.offer?.name || 'a prize';
	renderEventCard({ ...data, user: { name: 'Giveaway' }, text: `Type 'join' in the next ${data.durationSeconds} seconds for your chance to win!` }, 'donation', 'fourthwall', { description: `🎁 ${escapeHtml(itemName)} Giveaway!` });
}
function FourthwallGiftDrawEnded(data) {
	if (!showFourthwall) return;
	const winners = GetWinnersList(data.gifts);
	renderEventCard({ ...data, user: { name: 'Giveaway' }, text: winners ? `Congratulations ${winners}!` : '' }, 'donation', 'fourthwall', { description: `🥳 Giveaway Ended 🥳` });
}
function GetWinnersList(gifts) {
	if (!Array.isArray(gifts)) return '';
	return gifts.map(g => g.winner?.username || g.username || g.nickname).filter(Boolean).join(', ');
}

// ============================================================
//  Kick (chat via Streamer.bot; subs require Kick in Streamer.bot)
// ============================================================

// Render Kick inline emotes of the form [emote:id:name]
function RenderKickEmotes(message) {
	const emoteRegex = /\[emote:(\d+):([^\]]+)\]/g;
	return message.replace(emoteRegex, (_, id, name) =>
		`<img src="https://files.kick.com/emotes/${id}/fullsize" alt="${name}" title="${name}" class="emote" />`);
}

async function KickChatMessage(data) {
	if (!showKickMessages) return;
	if (data.text && data.text.startsWith("!") && excludeCommands) return;
	if (ignoreUserList.includes((data.user.name || '').toLowerCase())) return;

	const template = document.getElementById('messageTemplate');
	const instance = template.content.cloneNode(true);

	const replyDiv = instance.querySelector("#reply");
	if (data.isReply && data.reply && showMessage) {
		replyDiv.style.display = 'flex';
		const replyUserDiv = instance.querySelector("#replyUser");
		replyUserDiv.innerText = data.reply.userName;
		replyUserDiv.style.color = usernameChatColor('#53FC18');
		instance.querySelector("#replyMsg").innerText = data.reply.msgBody;
	} else if (replyDiv) {
		replyDiv.remove();
	}

	if (showTimestamps) instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	if (showUsername) {
		const usernameDiv = instance.querySelector("#username");
		usernameDiv.replaceWith(usernameMarquee(data.user.name, usernameChatColor(data.user.color || '#53FC18')));
	}

	const messageDiv = instance.querySelector("#message");
	if (showMessage) {
		messageDiv.innerText = data.text || '';
		messageDiv.innerHTML = RenderKickEmotes(messageDiv.innerHTML);
		messageDiv.innerHTML = messageDiv.innerHTML.replace(/(^|\s)(@[^\s<]+)/g, `$1<span style="font-weight: bold; color: #53FC18;">$2</span>`);
		messageDiv.innerHTML = linkify(messageDiv.innerHTML);
	}

	if (showPlatform) instance.querySelector("#platform").innerHTML = `<img src="icons/platforms/kick.png" class="platform"/>`;

	if (showBadges) {
		const badgeListDiv = instance.querySelector("#badgeList");
		badgeListDiv.innerHTML = "";
		(data.user.badges || []).forEach(b => {
			if (b.imageUrl) {
				const badge = new Image(); badge.src = b.imageUrl; badge.classList.add("badge");
				badgeListDiv.appendChild(badge);
			}
		});
	}

	if (showAvatar) {
		const avatarURL = await GetAvatar(data.user.name, data.user.profilePic || data.user.avatar || null, 'kick');
		instance.querySelector("#avatar").innerHTML = `<img src="${avatarURL}" class="avatar">`;
	}

	AddMessageItem(instance, data.messageId, 'kick', data.user.id);
}

async function KickFollow(data) {
	if (!showKickFollows) return;
	const user = { id: data.user?.id, name: data.user?.name };
	await renderFollowCard({ ...data, user }, 'kick');
}

async function KickSubscription(data) {
	if (!showKickSubs) return;
	const months = data.months || 1;
	const desc = months > 1 ? `Resubscribed (${months} months)` : `Subscribed for the first time!`;
	await renderEventCard({ ...data, user: { name: data.username } }, 'member', 'kick', { description: desc });
}

async function KickGiftedSubscriptions(data) {
	if (!showKickSubs) return;
	const count = data.gifted_usernames?.length || 0;
	await renderEventCard({ ...data, user: { name: data.gifter_username } }, 'giftbomb', 'kick', { description: `Gifted ${count} subscription${count === 1 ? '' : 's'} to the community!` });
}

// ============================================================
//  TikTok (via Tikfinity local websocket - opt-in)
//  Enable with &enableTikTokSupport=true (requires Tikfinity running)
// ============================================================

const enableTikTokSupport = GetBooleanParam("enableTikTokSupport", false);
let tikfinityWebsocket = null;

function TikfinityConnect() {
	if (!enableTikTokSupport) return;
	if (tikfinityWebsocket) return;

	tikfinityWebsocket = new WebSocket("ws://localhost:21213/");
	tikfinityWebsocket.onopen = () => console.log("TikFinity connected");
	tikfinityWebsocket.onclose = () => { tikfinityWebsocket = null; setTimeout(TikfinityConnect, 1000); };
	tikfinityWebsocket.onerror = () => { tikfinityWebsocket = null; setTimeout(TikfinityConnect, 1000); };
	tikfinityWebsocket.onmessage = (response) => {
		const payload = JSON.parse(response.data);
		switch (payload.event) {
			case 'chat': TikTokChat(payload.data); break;
			case 'follow': TikTokFollow(payload.data); break;
			case 'gift': TikTokGift(payload.data); break;
			case 'subscribe': TikTokSubscribe(payload.data); break;
		}
	};
}
window.addEventListener('load', TikfinityConnect);

async function TikTokChat(data) {
	if (!showTikTokChat) return;
	if (data.comment && data.comment.startsWith("!") && excludeCommands) return;
	if (ignoreUserList.includes((data.nickname || '').toLowerCase())) return;

	const template = document.getElementById('messageTemplate');
	const instance = template.content.cloneNode(true);

	const replyDiv = instance.querySelector("#reply");
	if (replyDiv) replyDiv.remove();

	if (showTimestamps) instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	if (showUsername) {
		const usernameDiv = instance.querySelector("#username");
		usernameDiv.replaceWith(usernameMarquee(data.nickname, usernameChatColor('#FF0050')));
	}

	const messageDiv = instance.querySelector("#message");
	if (showMessage) {
		messageDiv.innerText = data.comment || '';
		messageDiv.innerHTML = messageDiv.innerHTML.replace(/(^|\s)(@[^\s<]+)/g, `$1<span style="font-weight: bold; color: #FF0050;">$2</span>`);
		messageDiv.innerHTML = linkify(messageDiv.innerHTML);
	}

	if (showPlatform) instance.querySelector("#platform").innerHTML = `<img src="icons/platforms/tiktok.png" class="platform"/>`;

	if (showBadges) {
		const badgeListDiv = instance.querySelector("#badgeList");
		badgeListDiv.innerHTML = "";
		(data.userBadges || []).forEach(b => {
			if (b.type === 'image' && b.url) {
				const badge = new Image(); badge.src = b.url; badge.classList.add("badge");
				badgeListDiv.appendChild(badge);
			}
		});
	}

	if (showAvatar && data.profilePictureUrl) {
		instance.querySelector("#avatar").innerHTML = `<img src="${data.profilePictureUrl}" class="avatar">`;
	}

	AddMessageItem(instance, data.msgId, 'tiktok', data.userId);
}

function TikTokFollow(data) {
	if (!showTikTokFollows) return;
	renderFollowCard({ ...data, user: { id: data.userId, name: data.nickname, profileImageUrl: data.profilePictureUrl } }, 'tiktok');
}

function TikTokSubscribe(data) {
	if (!showTikTokSubs) return;
	const months = data.subMonth;
	const desc = months ? `Subscribed for ${months} month${months == 1 ? '' : 's'}` : `Subscribed on TikTok`;
	renderEventCard({ ...data, user: { id: data.userId, name: data.nickname, profileImageUrl: data.profilePictureUrl } }, 'member', 'tiktok', { description: desc });
}

function TikTokGift(data) {
	if (!showTikTokGifts) return;
	// For streakable gifts, only render once the streak ends (avoids spam)
	if (data.giftType === 1 && !data.repeatEnd) return;
	const qty = data.repeatCount ? ` x${data.repeatCount}` : '';
	renderEventCard({ ...data, user: { id: data.userId, name: data.nickname, profileImageUrl: data.profilePictureUrl } }, 'donation', 'tiktok', { description: `Sent ${escapeHtml(data.giftName || 'a gift')}${qty}` });
}

const Simplex3D = (function () {
	const F3 = 1.0 / 3.0, G3 = 1.0 / 6.0;
	const p = new Uint8Array([151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]);
	const perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
	for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; permMod12[i] = (perm[i] % 12); }
	function grad(hash, x, y, z) {
		const h = hash & 15; const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}
	return function (xin, yin, zin) {
		let n0, n1, n2, n3;
		const s = (xin + yin + zin) * F3; const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
		const t = (i + j + k) * G3; const X0 = i - t, Y0 = j - t, Z0 = k - t;
		const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
		let i1, j1, k1, i2, j2, k2;
		if (x0 >= y0) {
			if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; } else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; } else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
		} else {
			if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; } else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; } else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
		}
		const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
		const x2=x0-i2+2.0*G3, y2=y0-j2+2.0*G3, z2=z0-k2+2.0*G3;
		const x3=x0-1.0+3.0*G3, y3=y0-1.0+3.0*G3, z3=z0-1.0+3.0*G3;
		const ii=i&255, jj=j&255, kk=k&255;
		let t0=0.6-x0*x0-y0*y0-z0*z0; if(t0<0) n0=0.0; else { t0*=t0; n0=t0*t0*grad(permMod12[ii+perm[jj+perm[kk]]],x0,y0,z0); }
		let t1=0.6-x1*x1-y1*y1-z1*z1; if(t1<0) n1=0.0; else { t1*=t1; n1=t1*t1*grad(permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]],x1,y1,z1); }
		let t2=0.6-x2*x2-y2*y2-z2*z2; if(t2<0) n2=0.0; else { t2*=t2; n2=t2*t2*grad(permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]],x2,y2,z2); }
		let t3=0.6-x3*x3-y3*y3-z3*z3; if(t3<0) n3=0.0; else { t3*=t3; n3=t3*t3*grad(permMod12[ii+1+perm[jj+1+perm[kk+1]]],x3,y3,z3); }
		return 32.0*(n0+n1+n2+n3);
	};
})();

const BOIL_CFG = { cornerRadius: 20, strokeWidth: 7, noiseFreq: 4.2, noiseCoordScale: 0.006, noiseTimeScale: 1.0, noiseAmp: 1.5, divW: 200, divH: 60, divCorner: 10, padding: 10 };
// How far the line wanders off true. Capped at 4: the card sits inside 10px of
// padding and the stroke eats 3.5 of it, so past ~6 the outline would clip.
BOIL_CFG.noiseAmp = Math.max(0, Math.min(4, GetFloatParam("boilAmp") ?? BOIL_CFG.noiseAmp));
function boilBuildBasePath(W, H, R) {
	const pts =[]; const { divW, divH, divCorner } = BOIL_CFG;
	for (let i=0; i<divW; i++) pts.push({ x: R+(W-2*R)*(i/divW), y: 0 });
	for (let i=0; i<divCorner; i++) pts.push({ x: W-R+R*Math.cos(-Math.PI/2+(Math.PI/2)*(i/divCorner)), y: R+R*Math.sin(-Math.PI/2+(Math.PI/2)*(i/divCorner)) });
	for (let i=0; i<divH; i++) pts.push({ x: W, y: R+(H-2*R)*(i/divH) });
	for (let i=0; i<divCorner; i++) pts.push({ x: W-R+R*Math.cos((Math.PI/2)*(i/divCorner)), y: H-R+R*Math.sin((Math.PI/2)*(i/divCorner)) });
	for (let i=0; i<divW; i++) pts.push({ x: W-R-(W-2*R)*(i/divW), y: H });
	for (let i=0; i<divCorner; i++) pts.push({ x: R+R*Math.cos(Math.PI/2+(Math.PI/2)*(i/divCorner)), y: H-R+R*Math.sin(Math.PI/2+(Math.PI/2)*(i/divCorner)) });
	for (let i=0; i<divH; i++) pts.push({ x: 0, y: H-R-(H-2*R)*(i/divH) });
	for (let i=0; i<divCorner; i++) pts.push({ x: R+R*Math.cos(Math.PI+(Math.PI/2)*(i/divCorner)), y: R+R*Math.sin(Math.PI+(Math.PI/2)*(i/divCorner)) });
	return pts;
}
/* One scratch array of points, shared by every border and rewritten in place on
   each draw. The .map() this replaced built a fresh 560-object array every time —
   per card, per draw — and threw it away as soon as the path was traced. The
   points are consumed synchronously inside drawBoil before the next border gets
   a look in, so a single buffer serves all of them. */
const boilScratch = [];
function boilDeformPath(base, time, seed) {
	const freq = BOIL_CFG.noiseFreq * BOIL_CFG.noiseCoordScale, t = time * BOIL_CFG.noiseTimeScale;
	const out = boilScratch, n = base.length;
	if (out.length !== n) out.length = n;   // every base path is 560 points, but don't assume it
	for (let i=0; i<n; i++) {
		const p = base[i], o = out[i] || (out[i] = { x: 0, y: 0 });
		o.x = p.x + Simplex3D(p.x*freq+seed, p.y*freq+seed, t) * BOIL_CFG.noiseAmp;
		o.y = p.y + Simplex3D(p.x*freq+seed+99.9, p.y*freq+seed+99.9, t) * BOIL_CFG.noiseAmp;
	}
	return out;
}
/* Build the smoothed outline ONCE per draw and hand the same Path2D to the fill
   and the stroke. Tracing straight into the context meant replaying all 560
   quadraticCurveTo calls a second time to describe the identical shape that had
   just been filled — the path is rebuilt from scratch after every beginPath(), so
   the context had no way to know it was the same one. */
function boilBuildSmoothPath(pts) {
	const path = new Path2D();
	if (pts.length < 3) return path;
	let p1 = pts[0]; path.moveTo((pts[pts.length-1].x+p1.x)/2, (pts[pts.length-1].y+p1.y)/2);
	for (let i=0; i<pts.length; i++) { p1 = pts[i]; const p2 = pts[(i+1)%pts.length]; path.quadraticCurveTo(p1.x, p1.y, (p1.x+p2.x)/2, (p1.y+p2.y)/2); }
	path.closePath();
	return path;
}
/* Off-screen culling for the boiling borders. The message list holds up to 5×
   the viewport height of cards, so most of the borders that are animating are
   scrolled outside the browser source and nobody can see them boil. This
   observer flags which canvases actually intersect the viewport; the tick below
   skips the noise + path work for the rest. The boil is driven by absolute time
   (ts/1000), so a culled border picks straight back up in phase — it never
   "restarts" — and cards only ever scroll away from the visible area anyway. */
const boilVisibility = new IntersectionObserver(entries => {
	for (const e of entries) {
		// A card only becomes cullable once it has actually been on screen. While a
		// card is playing its 0.4s height grow-in it is clipped to a zero-height box,
		// which reads as "not intersecting" — without this gate the border would sit
		// blank for the whole entrance. Cards only ever drift away from the visible
		// area afterwards, so in practice this costs nothing.
		if (e.isIntersecting) { e.target._boilVisible = true; e.target._boilSeen = true; }
		else if (e.target._boilSeen) e.target._boilVisible = false;
	}
}, { rootMargin: '120px' });   // margin so a card is already boiling before it slides into view

/* How long a border has to stay off screen before its pixels are handed back.
   A card's backing store is ~0.6-0.8 MB (two of them on a card with a comment),
   and a busy hour's worth of cards sitting in the list adds up to tens of MB of
   canvas that nothing can see. The delay is hysteresis: a card that is merely
   grazing the cull boundary shouldn't churn its buffer. */
const BOIL_RELEASE_AFTER_MS = 2000;

/* The boil holds still while the card animates in.

   Redrawing the border costs the same in script whatever size the card is — the
   path is always 560 points — but the browser still has to rasterise the whole
   canvas each frame, and THAT scales with the card's area. A six-line comment is
   303k pixels against 131k for a one-line one, so a tall card was asking for more
   than twice the per-frame raster at the exact moment the list is also relaying
   out for the height transition and the body's words are animating in. That's why
   the hitch got worse the more lines a card had.

   So: paint the border once and hold that frame until the card has settled, then
   start boiling. The noise clock is rewound when it starts so the shape continues
   from the held frame rather than jumping to wherever the boil would have been —
   and since the card is clipping into view for that whole window, a border that
   starts wobbling half a second later is not something you can see. */
const BOIL_HOLD_ON_APPEAR_MS = 650;   // covers the 0.5s height + content transitions
// Which drawing in the sequence `tSec` falls on, and where that drawing sits in
// the noise field. Anchored to the page clock rather than a per-card counter so
// all the borders on screen turn over together.
const boilIndexAt = (tSec) => Math.floor(tSec * BOIL.fps);
const boilZ = (idx) => idx * BOIL.step;
/* Live handles, read fresh on every frame rather than closed over as constants.
   That means the boil can be dialled from the console — or from the OBS browser
   source's remote debugger — while cards are on screen, instead of reloading and
   losing everything you were looking at. The URL params above just set the
   starting values.  Try:  BOIL.step = 0.042   BOIL.fps = 8   BOIL.amp = 3       */
window.BOIL = {
	fps: boilFps,
	step: boilStep,
	get amp() { return BOIL_CFG.noiseAmp; },
	set amp(v) { BOIL_CFG.noiseAmp = Math.max(0, Math.min(6, v)); },
};

function initBoilingBorder(canvas, contentW, contentH, bottomExtension = 0) {
	const P = BOIL_CFG.padding, R = BOIL_CFG.cornerRadius, cw = contentW + P*2, ch = contentH + P*2 + bottomExtension;
	canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
	const ctx = canvas.getContext('2d');
	// Sizing a canvas allocates its backing store and resets the context state, so
	// the dpr scale has to be re-applied every time — on first use and again if the
	// buffer was released while off screen and the card comes back into view.
	let sized = false;
	function sizeCanvas() {
		canvas.width = cw * dpr; canvas.height = ch * dpr;
		ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
		sized = true;
	}
	function releaseCanvas() {
		canvas.width = 0; canvas.height = 0;   // hands the pixels back to the browser
		sized = false;
	}
	const basePath = boilBuildBasePath(contentW, contentH + bottomExtension, R), seed = Math.random() * 1000;
	canvas._boilVisible = true;          // assume visible until the observer has seen it on screen
	canvas._boilSeen = false;
	boilVisibility.observe(canvas);
	sizeCanvas();
	let culledAt = 0;
	function drawBoil(tSec) {
		ctx.clearRect(0, 0, cw, ch); ctx.save(); ctx.translate(P, P);
		const path = boilBuildSmoothPath(boilDeformPath(basePath, tSec, seed));
		ctx.fillStyle = '#ffffff'; ctx.fill(path);
		ctx.strokeStyle = '#000000'; ctx.lineWidth = BOIL_CFG.strokeWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
		ctx.stroke(path);
		ctx.restore();
	}
	let firstTs = 0, heldIdx = null, lastDrawnIdx = -1;
	function tick(ts) {
		// The card this canvas belonged to was removed (hideAfter, or the message
		// list pruning its top). Stop the loop and let it be collected — without
		// this the border kept boiling into a detached canvas for the rest of the
		// session, and every card ever shown left one behind.
		if (!canvas.isConnected) { boilVisibility.unobserve(canvas); return; }
		if (!canvas._boilVisible) {                       // scrolled out of the source
			if (!culledAt) culledAt = ts;
			else if (sized && ts - culledAt > BOIL_RELEASE_AFTER_MS) releaseCanvas();
			requestAnimationFrame(tick);
			return;
		}
		culledAt = 0;
		// Came back into view: the buffer was handed back, so it is empty and has to
		// be repainted on this frame rather than waiting for the next boil tick.
		// Came back into view with an empty buffer: forget what was drawn so the
		// checks below repaint on this frame instead of waiting for the next beat.
		if (!sized) { sizeCanvas(); heldIdx = null; lastDrawnIdx = -1; }
		if (!firstTs) firstTs = ts;

		// The card is still clipping into view. Put ONE drawing down and hold it —
		// the boil starts once the card has arrived, not while it is sliding in.
		if (ts - firstTs < BOIL_HOLD_ON_APPEAR_MS) {
			if (heldIdx === null) { heldIdx = boilIndexAt(ts / 1000); drawBoil(boilZ(heldIdx)); }
			requestAnimationFrame(tick);
			return;
		}
		// Arrived. Follow the shared beat. The loop still runs every frame — it is
		// a couple of comparisons and it keeps the cull and release checks
		// responsive — but the canvas, which is the part that has to be rasterised,
		// only repaints when the drawing actually changes.
		const idx = boilIndexAt(ts / 1000);
		if (idx !== lastDrawnIdx) { lastDrawnIdx = idx; drawBoil(boilZ(idx)); }
		requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);
}

/* ════════════════════════════════════════════════════════════════
   Marquee driver — ported from Music-Info-Card/test/collage.html.
   Two modes share ONE velocity profile (ease-in → cruise → ease-out):
     smooth   — Apple wrap: two copies, rest at home, cruise once around, loop.
     fadeswap — cruise to the end, hold, fade out, reset home, fade back in.
   Each card is its own timing group; a group's clock starts the moment the
   card is measured, so every card gets the same rest → scroll → loop rhythm
   from when it appears. The old "…" (text-overflow: ellipsis) treatment is
   replaced by these scrolling windows.
   ════════════════════════════════════════════════════════════════ */
const MQ = { speed: 50, fadePx: 8, pauseStart: 2000, easeMs: 650, smoothGap: 24, holdEnd: 900, fadeMs: 100, homeHold: 40 };
const MQ_V_CRUISE = MQ.speed / 1000;              // px per ms cruise velocity
const MQ_A_RAMP   = MQ_V_CRUISE / MQ.easeMs;      // px per ms² fixed accel/decel

// Total time to cover distance D under the shared accel → cruise → decel profile.
function mqScrollMs(D) {
	if (D <= 0) return 0;
	if (D >= MQ_V_CRUISE * MQ.easeMs) return D / MQ_V_CRUISE + MQ.easeMs;   // trapezoid
	return 2 * Math.sqrt(D / MQ_A_RAMP);                                    // triangle (too short to cruise)
}
// How far a line of distance D has moved `st` ms into its scroll (capped at D).
function mqTravel(D, st) {
	if (D <= 0 || st <= 0) return 0;
	const T = mqScrollMs(D); if (st >= T) return D;
	if (D >= MQ_V_CRUISE * MQ.easeMs) {
		const E = MQ.easeMs;
		if (st < E)     return 0.5 * MQ_A_RAMP * st * st;                          // accelerate
		if (st < T - E) return 0.5 * MQ_V_CRUISE * E + MQ_V_CRUISE * (st - E);     // cruise
		const q = T - st; return D - 0.5 * MQ_A_RAMP * q * q;                      // decelerate
	}
	const half = T / 2;
	if (st < half) return 0.5 * MQ_A_RAMP * st * st;
	const q = T - st; return D - 0.5 * MQ_A_RAMP * q * q;
}

const mqActive = [];   // live marquee runtime objects, ticked by one shared rAF loop

// Build the HTML for a marquee window. `smooth` lays down two wrapped copies;
// every other mode uses a single run. data-mq-mode is read back at measure time.
function marqueeHTML(text, { mode = 'fadeswap', fade = true, cls = '' } = {}) {
	const safe = escapeHtml(text == null ? '' : String(text));
	const winCls = 'mq' + (fade ? ' fade' : '') + (cls ? ' ' + cls : '');
	if (mode === 'smooth') {
		return `<div class="${winCls}" data-mq-mode="smooth"><span class="mq-inner" style="display:inline-flex;gap:${MQ.smoothGap}px">` +
			`<span class="mq-copy">${safe}</span><span class="mq-copy" aria-hidden="true">${safe}</span></span></div>`;
	}
	return `<div class="${winCls}" data-mq-mode="${mode}"><span class="mq-inner">${safe}</span></div>`;
}

// A fade-scroll username marquee element, used everywhere a username used to
// truncate with "…". Returns the .mq node ready to drop in place of a #username span.
function usernameMarquee(text, color) {
	const tpl = document.createElement('template');
	tpl.innerHTML = marqueeHTML(text, { mode: 'fadeswap', fade: true, cls: 'name-mq' }).trim();
	const mq = tpl.content.firstElementChild;
	if (color) mq.style.color = color;
	return mq;
}

// Apply the edge fade by writing the mask gradient INLINE (l, r are 0→1 fade
// presence per edge). We set the full mask-image string rather than driving a
// registered @property inside a CSS calc(): Chromium doesn't reliably repaint a
// mask gradient when only the custom property changes, so on stacked cards all
// but the first rendered a hard clip instead of the fade. The band width is a
// fixed MQ.fadePx (px, not %) so it stays soft on the narrow ~80px name windows.
function mqApplyFade(m, l, r) {
	if (!m.fade) return;
	let g = '';   // '' → no mask (no fade) when the line doesn't overflow
	if (m.O > 0) {
		const lp = (l * MQ.fadePx).toFixed(2), rp = (r * MQ.fadePx).toFixed(2);
		g = `linear-gradient(90deg, transparent 0, #000 ${lp}px, #000 calc(100% - ${rp}px), transparent 100%)`;
	}
	if (g === m._mask) return;   // skip redundant style writes
	m._mask = g;
	m.win.style.webkitMaskImage = g;
	m.win.style.maskImage = g;
}

function mqSetEdgeFade(m, off) {   // off ≤ 0; grows the left / right fade with overflow
	const l = m.O ? Math.min(1, (-off) / MQ.fadePx) : 0;
	const r = m.O ? Math.min(1, (m.O + off) / MQ.fadePx) : 0;
	mqApplyFade(m, l, r);
}

/* Transform / opacity are re-written every frame while a line is moving, but a
   marquee spends most of its cycle parked (the 2s rest at home, the hold at the
   end, and the whole of every non-overflowing line). Remembering the last value
   written skips the style write — and, for opacity, the toFixed() allocation —
   for those stretches. Rounding the offset to 1/100 px also lets the tail of an
   ease, where consecutive frames differ by far less than that, settle instead of
   writing a new transform for motion nobody can see. */
function mqSetTransform(m, off) {
	const v = Math.round(off * 100) / 100;
	if (v === m._off) return;
	m._off = v;
	m.inner.style.transform = `translateX(${v}px)`;
}
function mqSetOpacity(m, op) {
	if (op === m._op) return;
	m._op = op;
	m.inner.style.opacity = op.toFixed(3);
}

function mqTickSmooth(m, t) {
	if (m.O <= 0) { mqSetTransform(m, 0); mqApplyFade(m, 0, 0); return; }
	const tt = t % m.group.cycle;
	const off = tt < MQ.pauseStart ? 0 : -mqTravel(m.unit, tt - MQ.pauseStart);
	mqSetTransform(m, off);
	const d = Math.min(-off, m.unit + off);   // distance from the nearest home edge
	mqApplyFade(m, Math.max(0, Math.min(1, d / MQ.fadePx)), 1);   // wrapped copy always overflows the right
}

function mqTickFadeswap(m, t) {
	if (m.O <= 0) { mqSetTransform(m, 0); mqSetOpacity(m, 1); mqSetEdgeFade(m, 0); return; }
	const tt = t % m.group.cycle;
	const s0 = MQ.pauseStart, s1 = s0 + m.group.scrollDur, s2 = s1 + MQ.holdEnd, s3 = s2 + MQ.fadeMs, s4 = s3 + MQ.homeHold;
	let off = 0, op = 1;
	if (tt < s0)      { off = 0;  op = 1; }
	else if (tt < s1) { off = -mqTravel(m.O, tt - s0); op = 1; }              // cruise (caps at -O, holds)
	else if (tt < s2) { off = -m.O; op = 1; }                                // hold at end
	else if (tt < s3) { off = -m.O; op = 1 - (tt - s2) / MQ.fadeMs; }         // fade out
	else if (tt < s4) { off = 0;  op = 0; }                                   // reset home, hidden
	else              { off = 0;  op = Math.min(1, (tt - s4) / MQ.fadeMs); }  // fade in
	mqSetTransform(m, off);
	mqSetOpacity(m, op);
	mqSetEdgeFade(m, off);
}

function mqTickPark(m, t) {
	const off = (m.O > 0 && t > MQ.pauseStart) ? -mqTravel(m.O, t - MQ.pauseStart) : 0;
	mqSetTransform(m, off); mqSetEdgeFade(m, off);
}

function mqTick(m, t) {
	switch (m.mode) {
		case 'smooth':   mqTickSmooth(m, t); break;
		case 'fadeswap': mqTickFadeswap(m, t); break;
		default:         mqTickPark(m, t); break;
	}
}

// The loop only runs while something is actually scrolling — see mqEnsureRunning.
let mqRunning = false;

function mqLoop(now) {
	for (let i = mqActive.length - 1; i >= 0; i--) {
		const m = mqActive[i];
		if (!m.win.isConnected) { mqActive.splice(i, 1); continue; }   // card was removed → drop it
		if (!m.group || !m.group.ready) continue;
		mqTick(m, now - m.group.t0);
		// A line that fits its window never moves: overflow is measured once, so
		// after the single tick that puts it in its resting state there is nothing
		// left to animate. Most usernames fit, so this retires the large majority
		// of marquees instead of re-writing the same styles for them every frame.
		if (m.O <= 0) mqActive.splice(i, 1);
	}
	if (mqActive.length) requestAnimationFrame(mqLoop);
	else mqRunning = false;   // idle overlay → no loop at all until the next card
}
// Started on demand by startCardMarquees so an overlay with no scrolling text
// costs nothing per frame.
function mqEnsureRunning() {
	if (mqRunning) return;
	mqRunning = true;
	requestAnimationFrame(mqLoop);
}

/* Gift-sub two-name width sharing (max-min fairness), ported from collage.html:
     both fit        → each takes exactly what it needs (no scroll)
     one short/long  → short takes what it needs, long gets the rest
     both over half  → an even 50/50 split
   Run before measuring so each name's window width feeds its own overflow. */
function mqNaturalW(win) { const inner = win.querySelector('.mq-inner'); return inner ? inner.scrollWidth : win.scrollWidth; }
function mqFairSplit(avail, n1, n2) {
	if (n1 + n2 <= avail) return [n1, n2];
	const half = avail / 2;
	if (n1 <= half) return [n1, avail - n1];
	if (n2 <= half) return [avail - n2, n2];
	return [half, half];
}
function allocateGiftRow(root) {
	const content = root.querySelector('.sub-user-content.is-gift');
	if (!content) return;
	const cellA = content.querySelector('.gift-sender');
	const cellB = content.querySelector('#gift-receiver');
	const textA = cellA && cellA.querySelector('.mq');
	const textB = cellB && cellB.querySelector('.mq');
	if (!cellA || !cellB || !textA || !textB) return;
	// collapse both names to 0 so each cell reports just its fixed part
	// (avatar · platform · arrow), read the usable width, then share it.
	textA.style.flex = '0 0 auto'; textA.style.width = '0px';
	textB.style.flex = '0 0 auto'; textB.style.width = '0px';
	cellA.style.flex = '0 0 auto'; cellB.style.flex = '0 0 auto';
	const availText = Math.max(0, content.clientWidth - cellA.offsetWidth - cellB.offsetWidth);
	const [wA, wB] = mqFairSplit(availText, mqNaturalW(textA), mqNaturalW(textB));
	textA.style.width = Math.floor(wA) + 'px';
	textB.style.width = Math.floor(wB) + 'px';
}

// Discover every .mq in a freshly-added card, build its runtime object, measure
// overflow, and start the card's shared clock. One timing group per card.
function startCardMarquees(root) {
	allocateGiftRow(root);   // share gift-name widths first, then measure overflow
	const wins = root.querySelectorAll('.mq');
	if (!wins.length) return;
	const group = { scrollDur: 0, fadeTail: 0, cycle: 4000, t0: performance.now(), ready: false };
	let maxDist = 0, hasFade = false;
	wins.forEach(win => {
		const m = { win, inner: win.querySelector('.mq-inner'), fade: win.classList.contains('fade'), mode: win.dataset.mqMode || 'park', group, O: 0, unit: 0 };
		if (m.mode === 'smooth') {
			const copies = win.querySelectorAll('.mq-copy');
			const copyW = copies[0] ? copies[0].offsetWidth : m.inner.scrollWidth;
			m.O = Math.max(0, Math.round(copyW - win.clientWidth));
			m.unit = copyW + MQ.smoothGap;
			// only reveal the wrapped 2nd copy when the text actually overflows
			if (copies[1]) copies[1].style.display = m.O > 0 ? '' : 'none';
			if (m.O > 0) maxDist = Math.max(maxDist, m.unit);
		} else {
			m.O = Math.max(0, Math.round(m.inner.scrollWidth - win.clientWidth));
			if (m.O > 0) { maxDist = Math.max(maxDist, m.O); if (m.mode === 'fadeswap') hasFade = true; }
		}
		mqActive.push(m);
	});
	// the longest line sets the card's scroll time; shorter siblings reach their
	// end sooner and hold there until the whole card loops together.
	group.scrollDur = mqScrollMs(maxDist);
	group.fadeTail = hasFade ? (MQ.holdEnd + MQ.fadeMs + MQ.homeHold + MQ.fadeMs) : 0;
	group.cycle = MQ.pauseStart + group.scrollDur + group.fadeTail;
	group.ready = true;
	mqEnsureRunning();
}

/* ════════════════════════════════════════════════════════════════
   Word-by-word reveal for message bodies.

   NOT a typewriter, deliberately. AddMessageItem measures the finished message
   in a hidden container and then animates the line's height from 0 to that
   measured value, so text that grows as it "types" would re-wrap underneath a
   height measured for the finished text and the box would be wrong for most of
   the reveal. This is paint-only instead: the message is fully laid out from the
   first frame and each word just fades and rises into place.

   Keeping it layout-neutral is what the splitting below is careful about:
     · runs of whitespace stay as raw text nodes, so line breaking is untouched
     · a word becomes an inline-block, which changes nothing — a word was already
       the unit a line breaks on
     · an emote <img> reveals as one unit rather than being descended into
     · .mq subtrees are left alone: those are the scrolling marquee windows, and
       their widths have just been measured by startCardMarquees
   ════════════════════════════════════════════════════════════════ */
const WRITE = { step: 34, total: 420 };   // per-word stagger, and the cap on the whole reveal

// Replace text nodes with per-word spans, collecting them in document order.
function writeCollectWords(node, out) {
	for (const kid of Array.from(node.childNodes)) {
		if (kid.nodeType === Node.TEXT_NODE) {
			const frag = document.createDocumentFragment();
			for (const part of kid.data.split(/(\s+)/)) {      // keeps the separators
				if (!part) continue;
				if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
				const w = document.createElement('span');
				w.className = 'write-word';
				w.textContent = part;
				frag.appendChild(w);
				out.push(w);
			}
			node.replaceChild(frag, kid);
		} else if (kid.nodeType === Node.ELEMENT_NODE) {
			if (kid.classList.contains('mq')) continue;                                  // scrolling window — leave it be
			if (kid.tagName === 'IMG') { kid.classList.add('write-word'); out.push(kid); }  // emote = one unit
			else writeCollectWords(kid, out);
		}
	}
}

// Long messages tighten their step rather than taking seconds to become readable.
function writeInElement(el) {
	if (!el) return;
	const words = [];
	writeCollectWords(el, words);
	if (!words.length) return;
	el.classList.add('write-in');
	const step = Math.min(WRITE.step, WRITE.total / words.length);
	words.forEach((w, i) => { w.style.animationDelay = Math.round(i * step) + 'ms'; });
}

// The message bodies that get the reveal. Event-card headers ("Subscribed With
// Tier 1") are left alone — they're short labels, not something being said.
function writeInMessage(root) {
	if (!writingAnimation) return;
	writeInElement(root.querySelector('#message'));
	writeInElement(root.querySelector('.featured-message-text'));
	writeInElement(root.querySelector('.sub-comment-text'));
}

// onMeasured runs in the hidden measure pass, while the card is laid out but not
// yet on screen; onAdded runs on the frame it starts animating in. Anything with a
// one-off setup cost belongs in onMeasured, so the cost doesn't land on the same
// frame as the appear.
function AddMessageItem(element, elementID, platform, userId, customClasses = [], onAdded = null, onMeasured = null) {
	const tempContainer = document.createElement('div');
	tempContainer.style.cssText = `position:absolute; visibility:hidden; width:${BASE_WIDTH}px; pointer-events:none;`;
	
	const tempLi = document.createElement('li');
	tempLi.style.cssText = 'height:auto !important; transition:none !important; opacity:1 !important; display:block !important;';
	
	customClasses.forEach(cls => tempLi.classList.add(cls));
	
	tempLi.appendChild(element);
	tempContainer.appendChild(tempLi);
	
	const msgList = document.getElementById('messageList');
	msgList.appendChild(tempContainer);

	setTimeout(function () {
		const calculatedHeight = tempLi.offsetHeight + "px";

		// Still hidden here, and the layout the measurement above needed is already
		// done — the cheapest moment to do any heavy per-card setup. The children are
		// moved into the real line below without ever leaving the document, so a
		// canvas warmed here keeps its pixels.
		if (onMeasured) onMeasured(tempLi);

		const lineItem = document.createElement('li');
		lineItem.id = elementID;
		lineItem.dataset.platform = platform;
		lineItem.dataset.userId = userId;
		customClasses.forEach(cls => lineItem.classList.add(cls));
		
		if (scrollDirection === 2) lineItem.classList.add('reverseLineItemDirection');
		
		while (tempLi.firstChild) {
			lineItem.appendChild(tempLi.firstChild);
		}
		
		msgList.removeChild(tempContainer);
		msgList.appendChild(lineItem);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				lineItem.classList.add("show");
				lineItem.style.height = calculatedHeight;
				if (onAdded) onAdded(lineItem);
				// Every line, not just event cards: plain chat usernames are fade-scroll
				// windows too, and they need measuring once they're in the real layout.
				// startCardMarquees no-ops on a line that contains no .mq window.
				startCardMarquees(lineItem);
				// Split the body into words on the same frame the line starts opening,
				// so both animations run off one clock. After the marquees, so their
				// widths are measured on untouched markup.
				writeInMessage(lineItem);
			});
		});

		while (msgList.clientHeight > 5 * window.innerHeight) {
			if (msgList.firstChild) msgList.removeChild(msgList.firstChild);
			else break;
		}

		if (hideAfter > 0) {
			setTimeout(() => {
				lineItem.style.opacity = 0;
				lineItem.style.height = 0;
				lineItem.style.paddingTop = 0;
				lineItem.style.paddingBottom = 0;
				lineItem.style.marginTop = 0;
				lineItem.style.marginBottom = 0;
				setTimeout(() => lineItem.remove(), 400); 
			}, hideAfter * 1000);
		}
	}, 50);
}

function AddSubCardItem(element, elementID, platform, userId) {
	// The borders are set up in the measure pass, not on the frame the card appears.
	// Sizing a canvas allocates a backing store — ~0.6-0.8 MB each here, and a card
	// with a comment has two — and doing that plus the first noise draw on the same
	// frame the line starts opening is what made bordered cards hitch on their way
	// in. By the time the card is shown its pixels already exist and are painted.
	//
	// The scrolling name / song-info marquees stay in the shown pass: they measure
	// text against the real layout, which the hidden pass can't stand in for.
	AddMessageItem(element, elementID, platform, userId, ['sub-card-li'], null, (li) => {
		const tryInitBorder = (canvas, wrapper, extension, retries = 5) => {
			if (!canvas || !wrapper) return;
			const w = wrapper.offsetWidth, h = wrapper.offsetHeight;
			if (w > 0 && h > 0) initBoilingBorder(canvas, w, h, extension);
			else if (retries > 0) setTimeout(() => tryInitBorder(canvas, wrapper, extension, retries - 1), 50);
		};

		const mainCanvas = li.querySelector('.sub-border-canvas');
		const mainWrapper = li.querySelector('.sub-card-wrapper');
		const commentWrapperEl = li.querySelector('.sub-comment-wrapper');
		const extension = (commentWrapperEl && commentWrapperEl.style.display !== 'none') ? 26 : 0;
		tryInitBorder(mainCanvas, mainWrapper, extension);

		const commentCanvas = li.querySelector('.sub-comment-border-canvas');
		if (commentCanvas && commentWrapperEl && commentWrapperEl.style.display !== 'none') tryInitBorder(commentCanvas, commentWrapperEl, 0);
	});
}

function GetBooleanParam(paramName, defaultValue) {
	const val = new URLSearchParams(window.location.search).get(paramName);
	if (val === null) return defaultValue;
	return val.toLowerCase() === 'true';
}

function GetIntParam(paramName) {
	const val = parseInt(new URLSearchParams(window.location.search).get(paramName), 10);
	return isNaN(val) ? null : val;
}

function GetFloatParam(paramName) {
	const val = parseFloat(new URLSearchParams(window.location.search).get(paramName));
	return isNaN(val) ? null : val;
}

function GetCurrentTimeFormatted() {
	const now = new Date();
	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12; hours = hours ? hours : 12;
	return `${hours}:${minutes} ${ampm}`;
}

async function GetAvatar(username, providedUrl, platform) {
	if (providedUrl) return providedUrl;
	if (platform === 'twitch') {
		if (avatarMap.has(username)) {
			return avatarMap.get(username);
		} else {
			try {
				let response = await fetch('https://decapi.me/twitch/avatar/' + username);
				if (response.ok) {
					let data = await response.text();
					if (data && data.startsWith('http')) {
						avatarMap.set(username, data);
						return data;
					}
				}
			} catch (e) {
				console.error("Avatar Fetch failed:", e);
			}
		}
	}
	return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

function escapeHtml(text) {
	const div = document.createElement('div');
	div.innerText = text;
	return div.innerHTML;
}

function linkify(text) {
	return text.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, '<a href="$1" target="_blank">$1</a>');
}

function FindFirstImageUrl(jsonObject) {
	function iterate(obj) {
		if (Array.isArray(obj)) {
			for (const item of obj) { const res = iterate(item); if (res) return res; }
			return null;
		}
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key === 'imageUrl') return obj[key];
				if (typeof obj[key] === 'object' && obj[key] !== null) {
					const res = iterate(obj[key]); if (res) return res;
				}
			}
		}
		return null;
	}
	return iterate(jsonObject);
}

function IsImageUrl(url) {
	try {
		const { pathname } = new URL(url);
		return /\.(png|jpe?g|webp|gif)$/i.test(pathname);
	} catch (error) {
		return false;
	}
}

function IsThisUserAllowedToPostImagesOrNotReturnTrueIfTheyCanReturnFalseIfTheyCannot(targetPermissions, data, platform) {
	return GetPermissionLevel(data, platform) >= targetPermissions;
}

function GetPermissionLevel(data, platform) {
	switch (platform) {
		case 'twitch':
			if (data.message.role >= 4) return 40;
			else if (data.message.role >= 3) return 30;
			else if (data.message.role >= 2) return 20;
			else if (data.message.role >= 2 || data.message.subscriber) return 15;
			else return 10;
		case 'youtube':
			if (data.user.isOwner) return 40;
			else if (data.user.isModerator) return 30;
			else if (data.user.isSponsor) return 15;
			else return 10;
	}
}

// ============================================================
//  Song lookup (no API key, no server, runs in the browser)
//
//  A redemption is free text a viewer typed: "Robbery '95 - Necro",
//  "Miitopia OST - Extra Battle (Cyberpunk)", "Billie Jeans - Micheal Jackson".
//  Rather than guess which half is the title, the whole string is searched — the
//  way a person would paste it into a search box — against YouTube Music (clean
//  Title/Artist fields, commercial catalogue) and YouTube (game OSTs, remixes,
//  bootlegs: everything a label never released). Both are reached through Piped,
//  a CORS-enabled mirror, so this still works from an OBS browser source.
//
//  Every result is then SCORED against the words the viewer typed, and anything
//  that doesn't clear the floor is refused: a card that invents a song is worse
//  than no card. MusicBrainz and iTunes stay in the pipeline, demoted to what
//  they are good at — naming the original release and supplying cover art.
// ============================================================

function FormatSongDuration(ms) {
	if (!ms) return '?:??';
	const total = Math.round(ms / 1000);
	const m = Math.floor(total / 60);
	const s = String(total % 60).padStart(2, '0');
	return `${m}:${s}`;
}

// Strip the usual junk from a video title: "(Official Video)", "[Audio]", etc.
function CleanTrackTitle(t) {
	const junk = /official|video|audio|lyric(?:s)?|visuali[sz]er|remaster(?:ed)?|\bhd\b|\b4k\b|\bmv\b|m\/v|explicit|music\s*video|color\s*coded/i;
	return (t || '')
		.replace(/\(([^()]*)\)/g, (full, inner) => junk.test(inner) ? '' : full)
		.replace(/\[([^\[\]]*)\]/g, (full, inner) => junk.test(inner) ? '' : full)
		.replace(/\s{2,}/g, ' ')
		.trim();
}

// A featured artist is usually credited on the request but not in the track's own
// title ("Du ik værd at græde for (feat. Sira Jovina)" is published as "Du ik værd
// at græde for"). Requiring those words would score the real track below anything
// that happens to repeat them — a reaction video, say.
const SONG_FEAT_PART = /[\(\[]\s*(?:feat|ft|featuring|w\/|med)\b\.?[^)\]]*[\)\]]|\s+(?:feat|ft|featuring)\b\.?\s+.*$/gi;
const StripFeat = s => (s || '').replace(SONG_FEAT_PART, ' ').replace(/\s{2,}/g, ' ').trim();

const songNorm = s => (s || '').toLowerCase().normalize('NFKD').replace(/[‘’“”]/g, "'");
const songTokens = s => songNorm(s).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
const songUniq = a => [...new Set(a)];

// Chat misspells. "Billie Jeans - Micheal Jackson" is a letter off in two words and
// YouTube's own search corrects it — so the scorer must not then punish the correct
// answer for not matching the typo. Tolerance scales with word length; short words
// (du, ik, at, for) must still match exactly or everything looks like everything.
function EditDistance(a, b) {
	const m = a.length, n = b.length;
	let prev = Array.from({ length: n + 1 }, (_, j) => j);
	for (let i = 1; i <= m; i++) {
		const cur = [i];
		for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		prev = cur;
	}
	return prev[n];
}
const editSlack = n => (n >= 7 ? 2 : n >= 4 ? 1 : 0);
function FuzzyHas(list, t) {
	for (const r of list) {
		if (r === t) return true;
		const lim = editSlack(Math.max(r.length, t.length));
		if (lim && Math.abs(r.length - t.length) <= lim && EditDistance(r, t) <= lim) return true;
	}
	return false;
}

// Token F1 between the request and a candidate's "title + artist", feature credits
// stripped from BOTH sides — the catalogue entry spells every guest out and must not
// be punished for being complete. Recall alone would let a bloated title win;
// precision alone would let a one-word title win.
function ScoreMatch(candidateText, requestText) {
	const req = songUniq(songTokens(StripFeat(requestText)));
	const cand = songUniq(songTokens(StripFeat(candidateText)));
	if (!req.length || !cand.length) return 0;
	const precision = cand.filter(t => FuzzyHas(req, t)).length / cand.length;
	const recall = req.filter(t => FuzzyHas(cand, t)).length / req.length;
	return (precision + recall) ? (2 * precision * recall) / (precision + recall) : 0;
}

// Uploads that are ABOUT a song rather than the song. They carry both artist names
// and the full title, so they out-score the real track on words alone.
const NOT_THE_SONG = /\b(reaction|reakt\w*|reagerer|react(?:s|ing)?|review|anmeldelse|explained|breakdown|analysis|tutorial|karaoke|lesson|interview|first time (?:hearing|listening)|cover(?:ed)? by)\b/i;

// MusicBrainz lists a credit in its own order ("Berg, Svea S, Sofie1998"); the music
// apps lead with the track's primary artist ("Sofie1998, Berg, Svea S"). Only
// genuinely new names are appended, so "Tyler, The Creator" is never torn in two.
function MergeCredit(primary, credit) {
	const names = (credit || '').split(/\s*(?:,|&|\band\b|\bog\b)\s*/i).map(n => n.trim()).filter(Boolean);
	const have = songTokens(primary);
	const extra = names.filter(n => { const t = songTokens(n)[0]; return t && !FuzzyHas(have, t); });
	return extra.length ? [primary, ...extra].join(', ') : primary;
}

// ── Network ────────────────────────────────────────────────────────────────
// One cache for the browser source's lifetime: the artist-credit and the album come
// from the SAME MusicBrainz URL, and without this each would spend its own request —
// two a second is how you earn a 503, and a 503 reads as "song not found".
const _songCache = new Map();
let _lastMusicBrainz = 0;

async function SongFetch(url, timeoutMs = 5000) {
	const cached = _songCache.get(url);
	if (cached) return { ok: true, status: 200, json: async () => JSON.parse(cached || '{}'), text: async () => cached };

	const isMB = /musicbrainz\.org/.test(url);
	let resp, body;
	for (let attempt = 0; attempt < 2; attempt++) {
		// MusicBrainz allows ~1 request/second and answers 503 both above that and when
		// it is simply busy. A 503 comes back fast and is worth retrying; a silent stall
		// just costs a second full deadline, so it isn't.
		if (isMB) {
			const wait = Math.max(0, 1300 - (Date.now() - _lastMusicBrainz));
			if (wait) await new Promise(r => setTimeout(r, wait));
			_lastMusicBrainz = Date.now() + 1;
		}
		const ctl = new AbortController();
		const kill = setTimeout(() => ctl.abort(), timeoutMs);
		try { resp = await fetch(url, { signal: ctl.signal }); }
		catch (e) { console.debug('[song] request failed', url, e.name); return { ok: false, status: 0, json: async () => ({}), text: async () => '' }; }
		finally { clearTimeout(kill); }
		body = await resp.text();
		if (resp.status !== 503 || !isMB) break;
		console.debug('[song] MusicBrainz 503, retrying');
		await new Promise(r => setTimeout(r, 1500));
	}
	if (resp.ok) {
		if (_songCache.size > 200) _songCache.clear();
		_songCache.set(url, body);
	}
	return { ok: resp.ok, status: resp.status, json: async () => JSON.parse(body || '{}'), text: async () => body };
}

// A source that hasn't answered by its deadline has nothing to say. MusicBrainz is
// the slow one and is only ever a second opinion; without this the card waits on it
// even when YouTube Music has already answered.
function withDeadline(promise, ms) {
	let timer;
	return Promise.race([
		promise.catch(() => null).finally(() => clearTimeout(timer)),
		new Promise(res => { timer = setTimeout(() => res(null), ms); })
	]);
}

// Resolve true only if the image URL actually loads (catches dead Cover Art Archive
// links, 404s, hotlink refusals). Times out so a slow source can't stall the card.
function ImageLoads(url, timeoutMs = 2000) {
	return new Promise(resolve => {
		if (!url) return resolve(false);
		const img = new Image();
		let settled = false;
		const finish = ok => { if (!settled) { settled = true; resolve(ok); } };
		img.onload = () => finish(img.naturalWidth > 1);
		img.onerror = () => finish(false);
		setTimeout(() => finish(false), timeoutMs);
		img.src = url;
	});
}

// Start every candidate loading in PARALLEL, then resolve in priority order: returns
// the highest-priority URL that loads, so a slow/dead first candidate doesn't block.
async function ResolveAlbumArt(candidates, timeoutMs) {
	const checks = candidates.map(url => (url ? ImageLoads(url, timeoutMs) : Promise.resolve(false)));
	for (let i = 0; i < candidates.length; i++) {
		if (candidates[i] && await checks[i]) return candidates[i];
	}
	return '';
}

// ── YouTube Music / YouTube, through Piped ─────────────────────────────────
const PIPED_HOSTS = [
	'https://pipedapi.ducks.party',
	'https://api.piped.private.coffee',
	'https://pipedapi.kavin.rocks'
];

// YouTube Music serves the same artwork file for a track and for the album it belongs
// to, so the cover URL doubles as an album id.
const CoverId = u => (u || '').replace(/^https?:\/\/[^/]+\//, '').split('=')[0].split('?')[0];

// Piped proxies its thumbnails. Ask that proxy for a bigger copy first, then the copy
// it gave us, then YouTube's own video thumbnail — first one that loads wins.
function ThumbCandidates(thumb, watchUrl) {
	const out = [];
	if (thumb) {
		out.push(thumb.replace(/=w\d+-h\d+/, '=w544-h544'));
		out.push(thumb);
	}
	const id = (watchUrl || '').match(/v=([\w-]+)/);
	if (id) out.push(`https://i.ytimg.com/vi/${id[1]}/hqdefault.jpg`);
	return out;
}

async function PipedSearch(query, filter) {
	for (const host of PIPED_HOSTS) {
		let j;
		try {
			const r = await SongFetch(`${host}/search?q=${encodeURIComponent(query)}&filter=${filter}`, 6000);
			if (!r.ok) continue;
			j = await r.json();
		} catch (e) { continue; }
		const items = (j.items || []).filter(i => i.title && (i.duration || 0) > 0).slice(0, 6);
		if (!items.length) return [];
		return items.map(i => ({
			title: i.title.trim(),
			coverId: CoverId(i.thumbnail),
			artist: (i.uploaderName || '').replace(/\s*-\s*Topic$/i, '').trim(),
			durationMs: (i.duration || 0) * 1000,
			artCandidates: ThumbCandidates(i.thumbnail, i.url),
			via: filter === 'music_songs' ? 'YT Music' : 'YouTube'
		}));
	}
	console.debug('[song] every Piped instance failed');
	return [];
}

// `byArtist`: also accept the top album credited to this artist. YouTube Music ranks
// the album search by relevance to the query — which names the track — so for
// "Bliv hvor du er - Rosa" the one album by Rosa that comes back is the one holding
// it. The artist check is what keeps "Den nye pige - Blæst" out of Ramasjang's
// "Cirkus Summarum 2026".
async function AlbumSearch(query, coverId, byArtist) {
	for (const host of PIPED_HOSTS) {
		let j;
		try {
			const r = await SongFetch(`${host}/search?q=${encodeURIComponent(query)}&filter=music_albums`, 6000);
			if (!r.ok) continue;
			j = await r.json();
		} catch (e) { continue; }
		const items = j.items || [];
		const wrap = i => ({ album: i.name || i.title || '', artCandidates: ThumbCandidates(i.thumbnail, i.url) });
		const byCover = items.find(i => CoverId(i.thumbnail) === coverId);
		if (byCover) return wrap(byCover);
		if (byArtist) {
			const same = items.find(i => i.uploaderName && ScoreMatch(i.uploaderName, byArtist) >= 0.6);
			if (same) return wrap(same);
		}
		return null;
	}
	return null;
}

// A track's cover is often its single's, not its album's, so the cover match alone
// isn't enough; and a feature credit in the query narrows the album search to nothing.
async function YouTubeMusicAlbum(query, coverId, artist, trustArtistMatch) {
	if (!coverId) return null;
	let hit = await AlbumSearch(query, coverId, trustArtistMatch ? artist : null);
	const bare = StripFeat(query);
	if (!hit && bare && bare !== query) hit = await AlbumSearch(bare, coverId, trustArtistMatch ? artist : null);
	if (!hit && artist) hit = await AlbumSearch(artist, coverId);
	return hit;
}

// ── MusicBrainz / iTunes: the original release, and the full credit ────────
// Reissues, best-ofs and remaster compilations are rejected outright: taking
// releases[0] of recordings[0] is how "Spokesman" ended up on a 2005 best-of and
// "Robbery '95" picked up the cover of a 2020 remaster nobody asked for.
const BAD_SECONDARY = /compilation|live|dj-mix|mixtape|interview|audiobook|spokenword|remix/i;
const BAD_RELEASE_TITLE = /\b(best of|greatest hits|anthology|essential|very best|remaster(?:ed)?)\b/i;
const RELEASE_RANK = { Album: 0, EP: 1, Single: 2 };
const CoverArt = id => `https://coverartarchive.org/release/${id}/front-500`;

async function MusicBrainzOriginal(rawTitle, artist) {
	const title = StripFeat(rawTitle) || rawTitle;   // a credit in the title matches nothing
	const query = artist ? `recording:"${title}" AND artist:"${artist}"` : `recording:"${title}"`;
	// limit=100, not 25: for a track with dozens of reissues (Billie Jean) the original
	// album ranks below the first 25 rows and a smaller page misses it entirely.
	const resp = await SongFetch('https://musicbrainz.org/ws/2/recording/?fmt=json&limit=100&query=' + encodeURIComponent(query), 5000);
	if (!resp.ok) return null;
	const recs = (await resp.json()).recordings || [];
	if (!recs.length) return null;

	// The full artist credit, worth having even when no release survives the filter:
	// the credit and the album are separate questions and this response answers both.
	let credit = '';
	for (const rec of recs.slice(0, 5)) {
		const c = (rec['artist-credit'] || []).map(a => a.name).join(', ');
		if (c && FuzzyHas(songTokens(c), songTokens(artist)[0] || '')) { credit = c; break; }
	}

	const seen = new Set(), keep = [];
	for (const rec of recs) {
		const rc = (rec['artist-credit'] || []).map(a => a.name).join(', ');
		for (const rel of rec.releases || []) {
			const rg = rel['release-group'] || {};
			if (BAD_SECONDARY.test((rg['secondary-types'] || []).join(', ')) || BAD_RELEASE_TITLE.test(rel.title || '')) continue;
			if (seen.has(rel.id)) continue;
			seen.add(rel.id);
			keep.push({
				id: rel.id, album: rel.title || '', recTitle: rec.title || '', artist: rc,
				durationMs: rec.length || 0, rank: RELEASE_RANK[rg['primary-type']] ?? 3,
				date: rel.date || rg['first-release-date'] || '9999'
			});
		}
	}
	if (!keep.length) return { credit, title: recs[0].title || '', artist: credit, album: '', durationMs: 0, artCandidates: [] };

	// Earliest release wins — except that a single released as part of an album campaign
	// should credit the album, and the same calendar year is the tell: "Monster" and "My
	// Beautiful Dark Twisted Fantasy" are both 2010 (album), while "Die With A Smile"
	// (2024) stood alone until MAYHEM (2025) (single). Partial dates pad with 99 so a
	// bare year sorts after a dated release in the same year.
	const when = d => { const p = String(d).split('-'); return [p[0] || '9999', p[1] || '99', p[2] || '99'].join('-'); };
	keep.sort((a, b) => when(a.date).localeCompare(when(b.date)) || a.rank - b.rank);
	let top = keep[0];
	if (top.rank !== 0) {
		const sameYear = keep.find(k => k.rank === 0 && String(k.date).slice(0, 4) === String(top.date).slice(0, 4));
		if (sameYear) top = sameYear;
	}
	// Several pressings share one album but only some have cover art, so offer them all.
	return {
		credit, title: top.recTitle, artist: top.artist, album: top.album, durationMs: top.durationMs,
		artCandidates: keep.filter(k => k.album === top.album).slice(0, 6).map(k => CoverArt(k.id))
	};
}

async function ITunesOriginal(rawTitle, artist) {
	const title = StripFeat(rawTitle) || rawTitle;
	const term = (title + ' ' + artist).trim();
	const resp = await SongFetch('https://itunes.apple.com/search?entity=song&limit=15&term=' + encodeURIComponent(term), 5000);
	if (!resp.ok) return null;
	let results = (await resp.json()).results || [];
	if (artist) {
		const a = songNorm(artist);
		const byArtist = results.filter(x => songNorm(x.artistName).includes(a) || a.includes(songNorm(x.artistName)));
		if (byArtist.length) results = byArtist;
	}
	results = results.filter(x => !BAD_RELEASE_TITLE.test(x.collectionName || ''));
	if (!results.length) return null;
	results.sort((a, b) => String(a.releaseDate || '').localeCompare(String(b.releaseDate || '')));
	const pick = results[0];
	return {
		title: pick.trackName || '', artist: pick.artistName || '', album: pick.collectionName || '',
		durationMs: pick.trackTimeMillis || 0,
		artCandidates: pick.artworkUrl100 ? [pick.artworkUrl100.replace('100x100bb', '600x600bb')] : []
	};
}

// A pasted link isn't searchable text, so turn it into some.
//
// YouTube's oEmbed is enough on its own — its title is normally "Artist - Song".
// Spotify's is NOT: it returns the track title and nothing else, so a link to
// "Spinnin" by Connor Price came back as a different song called Spinnin. The artist
// only exists on the track page, which is CORS-blocked (and the corsproxy.io the old
// code used now wants an API key). r.jina.ai renders that page as text and is
// CORS-open, so one request gets the title, the artists, the album, the length and
// the cover art:
//
//   Title: Spinnin - song and lyrics by Connor Price, Bens
//   •[Spin The Globe](…)•2023•1:50•249,599,022
async function SpotifyTrackInfo(url) {
	const id = url.match(/track[/:]([A-Za-z0-9]+)/);
	if (!id) return null;
	const r = await SongFetch('https://r.jina.ai/https://open.spotify.com/track/' + id[1], 9000);
	if (!r.ok) return null;
	const text = await r.text();

	const head = text.match(/^Title:\s*(.+?)\s+-\s+song and lyrics by\s+(.+?)\s*$/m);
	if (!head) return null;
	const meta = text.match(/•\[([^\]]+)\]\([^)]*\)•(\d{4})•(\d+):(\d{2})•/);
	const art = text.match(/!\[Image \d+:[^\]]*\]\((https:\/\/i\.scdn\.co\/image\/[^)]+)\)/);

	return {
		title: head[1].trim(),
		artist: head[2].trim(),
		album: meta ? meta[1].trim() : '',
		durationMs: meta ? (Number(meta[3]) * 60 + Number(meta[4])) * 1000 : 0,
		albumArt: art ? art[1] : ''
	};
}

async function LinkToQuery(url) {
	try {
		if (/open\.spotify\.com|spotify:/i.test(url)) {
			const r = await SongFetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url), 4000);
			if (r.ok) { const j = await r.json(); if (j.title) return CleanTrackTitle(j.title); }
		} else if (/youtube\.com\/watch|youtu\.be\/|music\.youtube\.com/i.test(url)) {
			const r = await SongFetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(url), 4000);
			if (r.ok) { const j = await r.json(); if (j.title) return CleanTrackTitle(j.title); }
		}
	} catch (e) { /* fall through to searching the raw link text */ }
	return '';
}

const SONG_MATCH_FLOOR = 0.45;   // below this: no card, the request shows as a plain message

async function GetSongInfo(request) {
	let input = (request || '').trim();
	if (!input) return null;

	// A Spotify track link is a request for THAT recording, so its own metadata is the
	// fallback if the search can't place it.
	let spotify = null;
	if (/^https?:\/\//i.test(input) || /^spotify:/i.test(input)) {
		if (/open\.spotify\.com\/track|spotify:track:/i.test(input)) {
			spotify = await withDeadline(SpotifyTrackInfo(input), 10000);
			if (spotify) input = `${spotify.title} ${spotify.artist}`;
		}
		if (!spotify) {
			const fromLink = await LinkToQuery(input);
			if (fromLink) input = fromLink;
		}
	}
	const spotifyCard = async () => {
		if (!spotify || !spotify.title) return null;
		const art = await ResolveAlbumArt([spotify.albumArt], 4000);
		if (!art) return null;
		console.log(`[song] using Spotify's own metadata for "${spotify.title}"`);
		return { title: spotify.title, artist: spotify.artist, album: spotify.album || 'No album', durationMs: spotify.durationMs, albumArt: art };
	};

	// 1 — ask both catalogues with the request exactly as the viewer typed it
	const [songs, videos] = await Promise.all([
		PipedSearch(input, 'music_songs').catch(() => []),
		PipedSearch(input, 'videos').catch(() => [])
	]);

	// 2 — score every candidate against the request
	const featWords = songTokens(input).filter(t => !songTokens(StripFeat(input)).includes(t) && !/^(feat|ft|featuring|med)$/.test(t));
	const scored = [...songs, ...videos]
		.filter(c => !NOT_THE_SONG.test(c.title))
		.map(c => {
			const text = CleanTrackTitle(c.title) + ' ' + c.artist;
			let score = ScoreMatch(text, input);
			if (c.via === 'YT Music') score += 0.06;                                              // a music catalogue, not a video site
			if (featWords.length && featWords.every(w => FuzzyHas(songTokens(text), w))) score += 0.05;
			return { ...c, score };
		})
		.sort((a, b) => b.score - a.score);

	let best = scored[0];
	// A link is a request for one specific recording, and length is what identifies it:
	// "Spinnin" is 1:50 on Spotify but the music video on YouTube runs 2:19, and on words
	// alone the video wins because its title repeats both artists.
	if (spotify && spotify.durationMs) {
		const sameLength = scored.find(c => c.score >= SONG_MATCH_FLOOR && Math.abs(c.durationMs - spotify.durationMs) <= 3000);
		if (sameLength) best = sameLength;
	}
	// Same length = same recording. If the winner is a YouTube upload but that very
	// recording is also in the YouTube Music catalogue, take the catalogue one: same
	// audio, but a real artist field and an album instead of a re-upload channel's name.
	if (best && best.via !== 'YT Music') {
		const twin = scored.find(c => c.via === 'YT Music' && c.score >= SONG_MATCH_FLOOR && Math.abs(c.durationMs - best.durationMs) <= 3000);
		if (twin) best = twin;
	}
	if (!best || best.score < SONG_MATCH_FLOOR) {
		console.warn(`[song] nothing matched "${input}"`);
		return await spotifyCard();
	}

	// 3 — the album. Ask all three at once, in order of how likely each is to name the
	// ORIGINAL release, and whichever names it must also supply the artwork: a card
	// labelled "Thriller" showing the HIStory sleeve is worse than either on its own.
	const [mbOrig, ytAlbum, itunes] = await Promise.all([
		withDeadline(MusicBrainzOriginal(best.title, best.artist), 6000),
		withDeadline(YouTubeMusicAlbum(input, best.coverId, best.artist, best.via === 'YT Music'), 8000),
		withDeadline(ITunesOriginal(best.title, best.artist), 5000)
	]);
	// "Belongs to this track" is a containment question, not a similarity one:
	// MusicBrainz credits "Monster" to five artists, which a similarity score reads as
	// a different song entirely.
	const mine = songTokens(best.artist)[0] || '';
	const trust = r => !!r && !!r.title && ScoreMatch(r.title, best.title) >= 0.6 && (!mine || FuzzyHas(songTokens(r.artist || ''), mine));

	let album = '', albumArt = '', extraMs = 0;
	for (const [src, wait] of [[trust(mbOrig) ? mbOrig : null, 4000], [ytAlbum, 2000], [trust(itunes) ? itunes : null, 2000]]) {
		if (!src || !src.album) continue;
		const art = await ResolveAlbumArt(src.artCandidates || [], wait);
		if (!art) continue;
		album = src.album; albumArt = art; extraMs = src.durationMs || 0;
		break;
	}
	if (!album) albumArt = await ResolveAlbumArt(best.artCandidates || []);

	// 4 — the artist line. YouTube Music exposes ONE artist (the channel that owns the
	// track), so every collaborator is missing unless it was written into the title.
	// Three ways to get them back, none costing a request of its own: the credit that
	// came back with the album lookups, the "(feat. …)" in the title, and — last resort,
	// so a slow lookup can't silently shorten a credit — the one the viewer typed.
	let artist = best.artist;
	for (const credit of [mbOrig && mbOrig.credit, trust(itunes) && itunes.artist]) {
		if (!credit) continue;
		const merged = MergeCredit(artist, credit);
		if (songUniq(songTokens(merged)).length > songUniq(songTokens(artist)).length) artist = merged;
	}
	const creditedIn = text => {
		const m = (text || '').match(/[\(\[]\s*(?:feat|ft|featuring|med)\b\.?\s*([^)\]]+)[\)\]]/i);
		if (!m) return [];
		return m[1].split(/\s*(?:,|&|\band\b|\bog\b)\s*/i).map(n => n.trim()).filter(Boolean)
			.filter(n => { const t = songTokens(n)[0]; return t && !FuzzyHas(songTokens(artist), t); });
	};
	for (const names of [creditedIn(best.title), creditedIn(input)]) {
		if (names.length) artist = [artist, ...names].join(', ');
	}

	// No artwork means a card with a grey hole in it, and the overlay already has a
	// better answer for that: return nothing, and the redemption renders with the
	// request as its message, word for word.
	if (!albumArt) {
		console.warn(`[song] no artwork loaded for "${input}"`);
		return await spotifyCard();
	}

	// The guests are on the artist line now, so the title doesn't need them too:
	// "Monster (feat. JAY-Z, Rick Ross, Nicki Minaj & Bon Iver)" → "Monster".
	const info = {
		title: StripFeat(best.title) || best.title,
		artist,
		album: album || 'No album',
		durationMs: best.durationMs || extraMs,
		albumArt
	};

	console.log(
		`%c♪ ${info.title}%c\n   Artist:   ${info.artist}\n   Album:    ${info.album}\n   Duration: ${FormatSongDuration(info.durationMs)}\n   Source:   ${best.via} (match ${best.score.toFixed(2)})\n   Art URL:  ${info.albumArt}`,
		'font-weight:bold;font-size:13px', 'font-weight:normal'
	);
	return info;
}
