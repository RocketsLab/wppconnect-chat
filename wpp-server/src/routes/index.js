import {Router} from "express";
import {encryptSession} from "../controller/encryptController";
import * as MessageController from "../controller/messageController";
import * as GroupController from "../controller/groupController";
import * as DeviceController from "../controller/deviceController";
import * as SessionController from "../controller/sessionController";
import verifyToken from "../middleware/auth";
import statusConnection from "../middleware/statusConnection";
import multer from "multer";
import uploadConfig from "../config/upload";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const upload = multer(uploadConfig);
const routes = new Router();

//Generate Token
routes.post("/api/:session/:secretkey/generate-token", encryptSession);

//Start All Sessions
routes.post("/api/:secretkey/start-all", SessionController.startAllSessions);

//Sessions
routes.get("/api/:session/show-all-sessions", verifyToken, statusConnection, SessionController.showAllSessions);
routes.post("/api/:session/start-session", verifyToken, SessionController.startSession);
routes.post("/api/:session/close-session", verifyToken, SessionController.closeSession);
routes.post("/api/:session/logout-session", verifyToken, statusConnection, SessionController.logOutSession);
routes.get("/api/:session/check-connection-session", verifyToken, SessionController.checkConnectionSession);
routes.get("/api/:session/get-media-by-message/:messageId", verifyToken, SessionController.getMediaByMessage);
routes.get("/api/:session/status-session", verifyToken, SessionController.getSessionState);
routes.get("/api/:session/qrcode-session", verifyToken, SessionController.getQrCode);
routes.post("/api/:session/subscribe-presence", verifyToken, SessionController.subscribePresence);

//SendMessages
routes.post("/api/:session/send-message", verifyToken, statusConnection, MessageController.sendMessage);
routes.post("/api/:session/send-image", verifyToken, statusConnection, MessageController.sendImage);
routes.post("/api/:session/send-reply", verifyToken, statusConnection, MessageController.replyMessage);
routes.post("/api/:session/send-file", upload.single("file"), verifyToken, statusConnection, MessageController.sendFile);
routes.post("/api/:session/send-file-base64", verifyToken, statusConnection, MessageController.sendFile64);
routes.post("/api/:session/send-voice", verifyToken, statusConnection, MessageController.sendVoice);
routes.post("/api/:session/send-status", verifyToken, statusConnection, MessageController.sendStatusText);
routes.post("/api/:session/send-link-preview", verifyToken, statusConnection, MessageController.sendLinkPreview);
routes.post("/api/:session/send-location", verifyToken, statusConnection, MessageController.sendLocation);
routes.post("/api/:session/send-mentioned", verifyToken, statusConnection, DeviceController.sendMentioned);

// Group Functions
routes.post("/api/:session/create-group", verifyToken, statusConnection, GroupController.createGroup);
routes.post("/api/:session/leave-group", verifyToken, statusConnection, GroupController.leaveGroup);
routes.post("/api/:session/join-code", verifyToken, statusConnection, GroupController.joinGroupByCode);
routes.get("/api/:session/group-members/:groupId", verifyToken, statusConnection, GroupController.getGroupMembers);
routes.post("/api/:session/add-participant-group", verifyToken, statusConnection, GroupController.addParticipant);
routes.post("/api/:session/remove-participant-group", verifyToken, statusConnection, GroupController.removeParticipant);
routes.post("/api/:session/promote-participant-group", verifyToken, statusConnection, GroupController.promoteParticipant);
routes.post("/api/:session/demote-participant-group", verifyToken, statusConnection, GroupController.demoteParticipant);
routes.get("/api/:session/group-admins/:groupId", verifyToken, statusConnection, GroupController.getGroupAdmins);
routes.get("/api/:session/group-invite-link/:groupId", verifyToken, statusConnection, GroupController.getGroupInviteLink);
routes.get("/api/:session/all-broadcast-list", verifyToken, statusConnection, GroupController.getAllBroadcastList);
routes.get("/api/:session/all-groups", verifyToken, statusConnection, DeviceController.getAllGroups);
routes.post("/api/:session/group-info-from-invite-link", verifyToken, statusConnection, GroupController.getGroupInfoFromInviteLink);
routes.get("/api/:session/group-members-ids/:groupId", verifyToken, statusConnection, GroupController.getGroupMembersIds);
routes.post("/api/:session/group-description", verifyToken, statusConnection, GroupController.setGroupDescription);
routes.post("/api/:session/group-property", verifyToken, statusConnection, GroupController.setGroupProperty);
routes.post("/api/:session/group-subject", verifyToken, statusConnection, GroupController.setGroupSubject);
routes.post("/api/:session/messages-admins-only", verifyToken, statusConnection, GroupController.setMessagesAdminsOnly);
routes.post("/api/:session/group-pic", upload.single("file"), verifyToken, statusConnection, DeviceController.setGroupProfilePic);

//Chat Metthods
routes.post("/api/:session/archive-chat", verifyToken, statusConnection, DeviceController.archiveChat);
routes.post("/api/:session/clear-chat", verifyToken, statusConnection, DeviceController.clearChat);
routes.post("/api/:session/delete-chat", verifyToken, statusConnection, DeviceController.deleteChat);
routes.post("/api/:session/delete-message", verifyToken, statusConnection, DeviceController.deleteMessage);
routes.post("/api/:session/forward-messages", verifyToken, statusConnection, DeviceController.forwardMessages);
routes.get("/api/:session/all-chats", verifyToken, statusConnection, DeviceController.getAllChats);
routes.get("/api/:session/all-chats-with-messages", verifyToken, statusConnection, DeviceController.getAllChatsWithMessages);
routes.get("/api/:session/all-messages-in-chat/:phone", verifyToken, statusConnection, DeviceController.getAllMessagesInChat);
routes.get("/api/:session/all-new-messages", verifyToken, statusConnection, DeviceController.getAllNewMessages);
routes.get("/api/:session/unread-messages", verifyToken, statusConnection, DeviceController.getUnreadMessages);
routes.get("/api/:session/all-unread-messages", verifyToken, statusConnection, DeviceController.getAllUnreadMessages);
routes.get("/api/:session/chat-by-id/:phone", verifyToken, statusConnection, DeviceController.getChatById);
// routes.get("/api/:session/chat-group-by-id/:phone", verifyToken, statusConnection, DeviceController.getChatById);
routes.get("/api/:session/chat-is-online/:phone", verifyToken, statusConnection, DeviceController.getChatIsOnline);
routes.get("/api/:session/last-seen/:phone", verifyToken, statusConnection, DeviceController.getLastSeen);
routes.get("/api/:session/list-mutes/:type", verifyToken, statusConnection, DeviceController.getListMutes);
routes.get("/api/:session/load-messages-in-chat/:phone", verifyToken, statusConnection, DeviceController.loadAndGetAllMessagesInChat);
routes.post("/api/:session/mark-unseen", verifyToken, statusConnection, DeviceController.markUnseenMessage);
routes.post("/api/:session/pin-chat", verifyToken, statusConnection, DeviceController.pinChat);
routes.post("/api/:session/contact-vcard", verifyToken, statusConnection, DeviceController.sendContactVcard);
routes.post("/api/:session/send-mute", verifyToken, statusConnection, DeviceController.sendMute);
routes.post("/api/:session/send-seen", verifyToken, statusConnection, DeviceController.sendSeen);
routes.post("/api/:session/chat-state", verifyToken, statusConnection, DeviceController.setChatState);
routes.post("/api/:session/temporary-messages", verifyToken, statusConnection, DeviceController.setTemporaryMessages);
routes.post("/api/:session/typing", verifyToken, statusConnection, DeviceController.setTyping);
routes.post("/api/:session/star-message", verifyToken, statusConnection, DeviceController.starMessage);

//Contact Methods
routes.get("/api/:session/check-number-status/:phone", verifyToken, statusConnection, DeviceController.checkNumberStatus);
routes.get("/api/:session/all-contacts", verifyToken, statusConnection, DeviceController.getAllContacts);
routes.get("/api/:session/contact/:phone", verifyToken, statusConnection, DeviceController.getContact);
routes.get("/api/:session/profile/:phone", verifyToken, statusConnection, DeviceController.getNumberProfile);
routes.get("/api/:session/profile-pic/:phone", verifyToken, statusConnection, DeviceController.getProfilePicFromServer);
routes.get("/api/:session/profile-status/:phone", verifyToken, statusConnection, DeviceController.getStatus);

routes.post("/api/:session/block-contact", verifyToken, statusConnection, DeviceController.blockContact);
routes.post("/api/:session/unblock-contact", verifyToken, statusConnection, DeviceController.unblockContact);
routes.get("/api/:session/blocklist", verifyToken, statusConnection, DeviceController.getBlockList);
routes.get("/api/:session/get-battery-level", verifyToken, statusConnection, DeviceController.getBatteryLevel);
routes.get("/api/:session/host-device", verifyToken, statusConnection, DeviceController.getHostDevice);
routes.post("/api/:session/change-privacy-group", verifyToken, statusConnection, DeviceController.changePrivacyGroup);
routes.post('/api/:session/download-media', verifyToken, statusConnection, SessionController.downloadMediaByMessage);
routes.post('/api/:session/kill-service-workier', verifyToken, statusConnection, SessionController.killServiceWorker);
routes.post('/api/:session/restart-service', verifyToken, statusConnection, SessionController.restartService);

//Profile Methods
routes.post("/api/:session/profile-pic", upload.single("file"), verifyToken, statusConnection, DeviceController.setProfilePic);
routes.post("/api/:session/profile-status", verifyToken, statusConnection, DeviceController.setProfileStatus);
routes.post("/api/:session/change-username", verifyToken, statusConnection, DeviceController.setProfileName);

routes.use('/api-docs', swaggerUi.serve);
routes.get('/api-docs', swaggerUi.setup(swaggerDocument));

export default routes;