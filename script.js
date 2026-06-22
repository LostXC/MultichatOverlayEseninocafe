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

const font = urlParams.get("font") || "";
const fontSize = urlParams.get("fontSize") || "18";
const fontColor = urlParams.get("fontColor") || "#000000";
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

// Username colour for chat messages. The same taming runs whether or not the outline is
// on; with the outline on we use a gentler bright cap (less darkening) and a higher dark
// floor (a bit lighter), since the dark stroke is already providing contrast.
function usernameChatColor(color) {
    return contrastOutline
        ? tameUsernameColor(color, USERNAME_LUM_MAX_OUTLINE, USERNAME_LUM_MIN_OUTLINE)
        : tameUsernameColor(color, USERNAME_LUM_MAX, USERNAME_LUM_MIN);
}

async function renderFeaturedMessage(data, headerText, platform) {
	const template = document.getElementById('featuredMessageTemplate');
	if (!template) return;
	const instance = template.content.cloneNode(true);

	instance.querySelector(".featured-header-text").innerText = headerText;
	instance.querySelector("#timestamp").innerText = GetCurrentTimeFormatted();

	const usernameSpan = instance.querySelector("#username");
	usernameSpan.innerText = data.user.name;
	usernameSpan.style.color = tameUsernameColor(platform === 'twitch' ? '#A644FF' : '#FF0000');

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

	// Add cheer and watchstreak to the condition so their icons are removed
	if (type === 'channelpoint' || type === 'powerup' || type === 'cheer' || type === 'watchstreak') { 
		// Completely delete the image and the invisible spacing box from the HTML!
		if (iconImg) iconImg.remove();
		if (iconArea) iconArea.remove();
	} else { 
		// Event type -> [icon file, css class]. New categories use placeholder icons
		// cheer and watchstreak have been removed from this map
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
		usernameDiv.style.color = tameUsernameColor(opts.color || data.user?.color || GetPlatformColor(platform));
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
		const receiverSpan = instance.querySelector("#gift-receiver");
		if (receiverSpan) {
			receiverSpan.style.display = 'flex';
			const recAvatarDiv = instance.querySelector("#receiver-avatar");
			if (showAvatar) {
				const recAvatarURL = await GetAvatar(receiverName, data.recipient?.profileImageUrl, platform);
				recAvatarDiv.innerHTML = `<img src="${recAvatarURL}" class="avatar">`;
			}
			if (showPlatform) instance.querySelector("#receiver-platform").innerHTML = `<img src="icons/platforms/${platform}.png" class="platform"/>`;
			
			const recUsernameDiv = instance.querySelector("#receiver-username");
			recUsernameDiv.innerText = receiverName;
			recUsernameDiv.style.color = tameUsernameColor(opts.color || data.recipient?.color || GetPlatformColor(platform));
		}
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
		const usernameDiv = instance.querySelector("#username");
		usernameDiv.innerText = data.message.displayName;
		usernameDiv.style.color = usernameChatColor(data.message.color);
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

async function TwitchSub(data) { if (showTwitchSubs) await renderEventCard(data, 'sub', 'twitch'); }
async function TwitchResub(data) { if (showTwitchSubs) await renderEventCard(data, 'resub', 'twitch'); }
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
		usernameDiv.innerText = name;
		usernameDiv.style.color = tameUsernameColor(GetPlatformColor(platform));
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

	// Pick the correct bit gem color + matching outline based on cheer amount.
	// Twitch tiers: 1-99 gray, 100-999 purple, 1000-4999 green, 5000-9999 blue, 10000+ red.
	const bits = data.bits || 0;
	let bitColor, outlineColor;
	if      (bits >= 10000) { bitColor = 'red';    outlineColor = '#7a0000'; }
	else if (bits >= 5000)  { bitColor = 'blue';   outlineColor = '#1a3a7a'; }
	else if (bits >= 1000)  { bitColor = 'green';  outlineColor = '#005000'; }
	else if (bits >= 100)   { bitColor = 'purple'; outlineColor = '#5e1a9e'; }
	else                    { bitColor = 'gray';   outlineColor = '#3a3a3a'; }

	const staticBitUrl = `https://static-cdn.jtvnw.net/bits/dark/static/${bitColor}/2`;
	const outlinedUrl = await makeOutlinedIcon(staticBitUrl, 5, outlineColor);

	const bitIcon = `<img src="${outlinedUrl}" class="sub-inline-icon" style="filter: none; height: 1.3em; width: auto; margin-left: 1px; margin-right: 0; vertical-align: -0.3em;">`;

	const description = `Cheered ${data.bits}${bitIcon}`;
	await renderEventCard({ user: data.user, bits: data.bits, text }, 'cheer', 'twitch', { description });
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

			htmlContent = `
				<div class="music-ui-container">
					<img class="music-ui-art" src="${artUrl}" onerror="this.style.display='none'" />
					<div class="music-ui-info">
						<div class="music-ui-title">${escapeHtml(songInfo.title)}</div>
						${songInfo.album ? `<div class="music-ui-album">${escapeHtml(songInfo.album)}</div>` : ''}
						<div class="music-ui-artist-row">
							<span class="music-ui-artist">${escapeHtml(songInfo.artist)}</span>
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

	if (count === 1) renderEventCard(data, 'gift', platform);
	else renderEventCard({ ...data, giftCount: count, recipient: null, messageId: `giftbomb-${Date.now()}` }, 'giftbomb', platform);
}

async function TwitchGiftSub(data) { if (showTwitchSubs) accumulateGift(data, 'twitch'); }

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
		usernameDiv.innerText = data.user.name;
		usernameDiv.style.color = usernameChatColor('#f70000');
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
		const addBadge = (icon) => { const b = new Image(); b.src = `icons/badges/${icon}`; b.style.filter = `invert(100%)`; b.classList.add("badge"); badgeListDiv.appendChild(b); };
		if (data.user.isOwner) addBadge('youtube-broadcaster.svg');
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
		usernameDiv.innerText = data.user.name;
		usernameDiv.style.color = usernameChatColor(data.user.color || '#53FC18');
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
		usernameDiv.innerText = data.nickname;
		usernameDiv.style.color = usernameChatColor('#FF0050');
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
function boilDeformPath(base, time, seed) {
	const freq = BOIL_CFG.noiseFreq * BOIL_CFG.noiseCoordScale, t = time * BOIL_CFG.noiseTimeScale;
	return base.map(p => ({ x: p.x + Simplex3D(p.x*freq+seed, p.y*freq+seed, t) * BOIL_CFG.noiseAmp, y: p.y + Simplex3D(p.x*freq+seed+99.9, p.y*freq+seed+99.9, t) * BOIL_CFG.noiseAmp }));
}
function boilTraceSmoothPath(c, pts) {
	if (pts.length < 3) return; c.beginPath(); let p1 = pts[0]; c.moveTo((pts[pts.length-1].x+p1.x)/2, (pts[pts.length-1].y+p1.y)/2);
	for (let i=0; i<pts.length; i++) { p1 = pts[i]; const p2 = pts[(i+1)%pts.length]; c.quadraticCurveTo(p1.x, p1.y, (p1.x+p2.x)/2, (p1.y+p2.y)/2); }
	c.closePath();
}
function initBoilingBorder(canvas, contentW, contentH, bottomExtension = 0) {
	const P = BOIL_CFG.padding, R = BOIL_CFG.cornerRadius, cw = contentW + P*2, ch = contentH + P*2 + bottomExtension;
	canvas.width = cw * dpr; canvas.height = ch * dpr;
	canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
	const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
	const basePath = boilBuildBasePath(contentW, contentH + bottomExtension, R), seed = Math.random() * 1000;
	function tick(ts) {
		ctx.clearRect(0, 0, cw, ch); ctx.save(); ctx.translate(P, P);
		const deformed = boilDeformPath(basePath, ts / 1000, seed);
		ctx.fillStyle = '#ffffff'; boilTraceSmoothPath(ctx, deformed); ctx.fill();
		ctx.strokeStyle = '#000000'; ctx.lineWidth = BOIL_CFG.strokeWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
		boilTraceSmoothPath(ctx, deformed); ctx.stroke();
		ctx.restore(); requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);
}

function AddMessageItem(element, elementID, platform, userId, customClasses = [], onAdded = null) {
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
	AddMessageItem(element, elementID, platform, userId, ['sub-card-li'], (li) => {
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
//  Song lookup (no API key, runs in the browser)
// ============================================================

function FormatSongDuration(ms) {
	if (!ms) return '?:??';
	const total = Math.round(ms / 1000);
	const m = Math.floor(total / 60);
	const s = String(total % 60).padStart(2, '0');
	return `${m}:${s}`;
}

function ParseSongRequest(text) {
	let parts = text.split(/\s+-\s+/);
	if (parts.length >= 2) return { title: parts[0].trim(), artist: parts.slice(1).join(' - ').trim() };
	parts = text.split(/\s+by\s+/i);
	if (parts.length >= 2) return { title: parts[0].trim(), artist: parts.slice(1).join(' by ').trim() };
	return { title: text.trim(), artist: '' };
}

async function SpotifyInfoFromUrl(url) {
	const resp = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
	if (!resp.ok) return null;
	const j = await resp.json();
	return { title: j.title || '', thumbnail: j.thumbnail_url || '' };
}

// Resolve true only if the image URL actually loads (catches dead Cover Art Archive
// links, 404s, etc.). Times out so a slow source can't stall the card forever.
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
// the highest-priority URL that loads. Because the loads run concurrently, a slow/dead
// first candidate doesn't block the others — by the time we check them they're ready.
async function ResolveAlbumArt(candidates) {
	const checks = candidates.map(url => (url ? ImageLoads(url) : Promise.resolve(false)));
	for (let i = 0; i < candidates.length; i++) {
		if (candidates[i] && await checks[i]) return candidates[i];
	}
	return '';
}

async function SearchMusicBrainz(title, artist) {
	const query = artist ? `recording:"${title}" AND artist:"${artist}"` : `recording:"${title}"`;
	const url = 'https://musicbrainz.org/ws/2/recording/?fmt=json&limit=5&query=' + encodeURIComponent(query);
	const resp = await fetch(url);
	if (!resp.ok) return null;
	const rec = ((await resp.json()).recordings || [])[0];
	if (!rec) return null;
	
	const releaseId = (rec.releases || [])[0]?.id;
	const albumArt = releaseId ? `https://coverartarchive.org/release/${releaseId}/front-500` : '';
	
	return {
		title: rec.title || '',
		artist: (rec['artist-credit'] || []).map(a => a.name).join(', '),
		album: (rec.releases || [])[0]?.title || '',
		durationMs: rec.length || 0,
		albumArt: albumArt
	};
}

async function SearchITunes(title, artist) {
	const term = (title + ' ' + artist).trim();
	const url = 'https://itunes.apple.com/search?entity=song&limit=15&term=' + encodeURIComponent(term);
	const resp = await fetch(url);
	if (!resp.ok) return null;
	const results = (await resp.json()).results || [];
	let pick = results[0];
	if (artist) {
		const a = artist.toLowerCase();
		pick = results.find(x => (x.artistName || '').toLowerCase().includes(a)) || pick;
	}
	if (!pick) return null;
	
	const albumArt = pick.artworkUrl100 ? pick.artworkUrl100.replace('100x100bb', '600x600bb') : '';
	
	return {
		title: pick.trackName || '',
		artist: pick.artistName || '',
		album: pick.collectionName || '',
		durationMs: pick.trackTimeMillis || 0,
		albumArt: albumArt
	};
}

// Read a Spotify TRACK's exact metadata from its public embed page (the same data the
// Python scraper reads). The embed is CORS-blocked, so we go through a public CORS proxy
// — meaning no server is needed on the streamer's PC, just the browser source. Returns
// authoritative title/artist/duration/art (album name isn't in the embed; filled later).
async function SpotifyEmbedInfo(url) {
	const idMatch = url.match(/track[/:]([A-Za-z0-9]+)/);
	if (!idMatch) return null;
	const embed = 'https://open.spotify.com/embed/track/' + idMatch[1];
	let html;
	try {
		const resp = await fetch('https://corsproxy.io/?url=' + encodeURIComponent(embed));
		if (!resp.ok) return null;
		html = await resp.text();
	} catch (e) { return null; }

	const m = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
	if (!m) return null;
	let entity;
	try { entity = JSON.parse(m[1])?.props?.pageProps?.state?.data?.entity; } catch (e) { return null; }
	if (!entity || !entity.name) return null;

	const artist = (entity.artists || []).map(a => a.name).filter(Boolean).join(', ') || entity.subtitle || '';
	let albumArt = '';
	const vi = entity.visualIdentity?.image || [];
	if (vi.length) albumArt = vi.slice().sort((a, b) => (b.maxWidth || 0) - (a.maxWidth || 0))[0].url;
	if (!albumArt && entity.coverArt?.sources?.length) albumArt = entity.coverArt.sources.slice().sort((a, b) => (b.width || 0) - (a.width || 0))[0].url;

	return { title: entity.name, artist, durationMs: entity.duration || 0, albumArt, authoritative: true };
}

// Strip the usual junk from a (YouTube) video title: "(Official Video)", "[Audio]", etc.
function CleanTrackTitle(t) {
	const junk = /official|video|audio|lyric(?:s)?|visuali[sz]er|remaster(?:ed)?|\bhd\b|\b4k\b|\bmv\b|m\/v|explicit|music\s*video|color\s*coded/i;
	return (t || '')
		.replace(/\(([^()]*)\)/g, (full, inner) => junk.test(inner) ? '' : full)
		.replace(/\[([^\[\]]*)\]/g, (full, inner) => junk.test(inner) ? '' : full)
		.replace(/\s{2,}/g, ' ')
		.trim();
}

// Resolve a YouTube / YouTube Music link to a {title, artist} seed via public oEmbed.
// YouTube titles are usually "Artist - Song"; if there's no dash we fall back to the
// channel name (minus "VEVO" / "- Topic") as the artist.
async function YouTubeInfo(url) {
	let resp;
	try { resp = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(url)); }
	catch (e) { return null; }
	if (!resp.ok) return null;
	const j = await resp.json();
	const cleaned = CleanTrackTitle(j.title || '');
	if (!cleaned) return null;

	let title, artist;
	const parts = cleaned.split(/\s+-\s+/);
	if (parts.length >= 2) { artist = parts[0].trim(); title = parts.slice(1).join(' - ').trim(); }
	else { title = cleaned; artist = (j.author_name || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim(); }

	return { title, artist, authoritative: false };
}

async function GetSongInfo(request) {
	const input = (request || '').trim();
	if (!input) { console.warn('[song] empty request'); return null; }

	// Resolve the input into a search "seed". A Spotify track embed is authoritative
	// (exact title/artist/duration/art); YouTube links and plain text only seed the search.
	let seed = null;
	if (/open\.spotify\.com\/track|spotify:track:/i.test(input)) {
		seed = await SpotifyEmbedInfo(input);
		if (!seed) {                                   // proxy/embed failed → oEmbed title + thumbnail
			const sp = await SpotifyInfoFromUrl(input).catch(() => null);
			if (sp) { const p = ParseSongRequest(sp.title || ''); seed = { title: p.title, artist: p.artist, albumArt: sp.thumbnail, authoritative: false }; }
		}
	} else if (/open\.spotify\.com|spotify:/i.test(input)) {   // album/playlist/other Spotify → best-effort
		const sp = await SpotifyInfoFromUrl(input).catch(() => null);
		if (sp) { const p = ParseSongRequest(sp.title || ''); seed = { title: p.title, artist: p.artist, albumArt: sp.thumbnail, authoritative: false }; }
	} else if (/youtube\.com\/watch|youtu\.be\/|music\.youtube\.com/i.test(input)) {
		seed = await YouTubeInfo(input);
	} else {
		const p = ParseSongRequest(input);
		seed = { title: p.title, artist: p.artist, authoritative: false };
	}

	if (!seed || !seed.title) { console.warn(`[song] could not resolve "${input}"`); return null; }

	// Enrich (album/duration/art + canonical names) via MusicBrainz + iTunes in parallel.
	const [mb, itunes] = await Promise.all([
		SearchMusicBrainz(seed.title, seed.artist).catch(e => { console.debug('[song] MusicBrainz error', e); return null; }),
		SearchITunes(seed.title, seed.artist).catch(e => { console.debug('[song] iTunes error', e); return null; }),
	]);
	const enrich = mb || itunes || {};

	let info, artCandidates;
	if (seed.authoritative) {
		// Trust the Spotify embed for title/artist/duration/art; only borrow the album name.
		info = { title: seed.title, artist: seed.artist, album: enrich.album || '', durationMs: seed.durationMs || enrich.durationMs || 0 };
		artCandidates = [seed.albumArt, itunes && itunes.albumArt, mb && mb.albumArt];
	} else {
		// Prefer the canonical search result; fall back to the raw seed if nothing matched.
		info = enrich.title
			? { title: enrich.title, artist: enrich.artist, album: enrich.album || '', durationMs: enrich.durationMs || 0 }
			: { title: seed.title, artist: seed.artist, album: '', durationMs: 0 };
		artCandidates = [itunes && itunes.albumArt, mb && mb.albumArt, seed.albumArt];
	}
	info.albumArt = await ResolveAlbumArt(artCandidates);

	console.log(
		`%c♪ ${info.title}%c\n   Artist:   ${info.artist}\n   Album:    ${info.album}\n   Duration: ${FormatSongDuration(info.durationMs)}\n   Art URL:  ${info.albumArt || '(none found)'}`,
		'font-weight:bold;font-size:13px', 'font-weight:normal'
	);
	return info;
}