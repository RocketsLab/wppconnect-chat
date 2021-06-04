import fs from "fs";
import {download} from "./sessionController";
import {contactToArray, unlinkAsync} from "../util/functions";
import Logger from "../util/logger";
import {config} from "../util/sessionUtil";
import mime from "mime-types";

export async function setProfileName(req, res) {
    const session = req.session;
    const {name} = req.body;

    if (!name)
        return res.status(401).send({message: "Parameter name is required!"});

    try {

        const result = await req.client.setProfileName(name);
        return res.status(200).json({status: "success", response: result});
    } catch (error) {
        Logger.error(error);
        res.status(400).json({
            response: {
                message: "Error on set profile name.",
                session: session,
                log: error
            },
        });
    }
}

export async function showAllContacts(req, res) {
    const session = req.session;

    try {
        const contacts = await req.client.getAllContacts();
        res.status(200).json({
            response: contacts,
            session: session,
        });
    } catch (error) {
        Logger.error(error);
        res.status(401).json({
            response: "Error fetching contacts",
            session: session,
        });
    }
}

export async function getAllGroups(req, res) {
    const session = req.session;

    try {
        const response = await req.client.getAllGroups();


        return res.status(200).json({"response": response});
    } catch (e) {
        Logger.error(e);
        res.status(401).json({
            status: "Error",
            message: "Error fetching groups",
            session: session,
        });
    }
}

export async function getAllChats(req, res) {
    try {
        const response = await req.client.getAllChats();
        return res.status(200).json({status: "Success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "Error", response: "Error on get all chats"});
    }
}

export async function getAllChatsWithMessages(req, res) {
    try {
        const response = await req.client.getAllChatsWithMessages();
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get all chats whit messages"});
    }
}

export async function getAllMessagesInChat(req, res) {
    try {
        let {phone} = req.params;
        const {isGroup = false, includeMe = true, includeNotifications = true} = req.query;

        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.getAllMessagesInChat(contato, includeMe, includeNotifications);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get all messages in chat"});
    }
}

export async function getAllNewMessages(req, res) {
    try {
        const response = await req.client.getAllNewMessages();
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get all messages in chat"});
    }
}

export async function getAllUnreadMessages(req, res) {
    try {
        const response = await req.client.getAllUnreadMessages();
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get all messages in chat"});
    }
}

export async function getChatById(req, res) {
    const {phone} = req.params;
    const {isGroup} = req.query;

    try {
        let allMessages = {};

        if (isGroup) {
            allMessages = await req.client.getAllMessagesInChat(`${phone}@g.us`, true, true);
        } else {
            allMessages = await req.client.getAllMessagesInChat(`${phone}@c.us`, true, true);
        }


        let dir = "./WhatsAppImages";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        allMessages.map((message) => {
            if (message.type === "sticker") {
                download(message, req.client);
                message.body = `${config.host}:${config.port}/files/file${message.t}.${mime.extension(message.mimetype)}`;
            }
        });

        return res.json({status: "Success", response: allMessages});
    } catch (e) {
        Logger.error(e);
        return res.json({status: "Error", response: []});
    }
}

export async function changePrivacyGroup(req, res) {
    const {phone, status} = req.body;

    try {
        for (const contato of contactToArray(phone)) {
            await req.client.setMessagesAdminsOnly(`${contato}@g.us`, status === "true");
        }

        return res.status(200).json({status: "Success", message: "Group privacy changed successfully"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error changing group privacy"});
    }
}

export async function getBatteryLevel(req, res) {
    try {
        let response = await req.client.getBatteryLevel();
        return res.status(200).json({status: "Success", batterylevel: response});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error retrieving battery status"});
    }
}

export async function getHostDevice(req, res) {
    try {
        const response = await req.client.getHostDevice();
        return res.status(200).json({status: 'success', response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Erro ao recuperar dados do telefone"});
    }
}

export async function getBlockList(req, res) {
    let response = await req.client.getBlockList();

    try {
        const blocked = response.map((contato) => {
            return {phone: contato ? contato.split("@")[0] : ""};
        });

        return res.status(200).json({status: "Success", response: blocked});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error retrieving blocked contact list"});
    }
}

export async function deleteChat(req, res) {
    const {phone, isGroup = false} = req.body;

    try {
        if (isGroup) {
            await req.client.deleteChat(`${phone}@g.us`);
        } else {
            await req.client.deleteChat(`${phone}@c.us`);
        }
        return res.status(200).json({status: "Success", message: "Conversa deleteada com sucesso"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Erro ao deletada conversa"});
    }
}

export async function clearChat(req, res) {
    const {phone, isGroup = false} = req.body;

    try {
        if (isGroup) {
            await req.client.clearChat(`${phone}@g.us`);
        } else {
            await req.client.clearChat(`${phone}@c.us`);
        }
        return res.status(200).json({status: "Success", message: "Successfully cleared conversation"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error clearing conversation"});
    }
}

export async function archiveChat(req, res) {
    const {phone, value = true, isGroup = false} = req.body;

    try {
        let response;
        if (isGroup) {
            response = await req.client.archiveChat(`${phone}@g.us`, value);
        } else {
            response = await req.client.archiveChat(`${phone}@c.us`, value);
        }
        return res.status(200).json({status: "Success", message: "Chat archived!", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on archive chat"});
    }
}

export async function deleteMessage(req, res) {
    const {phone, messageId} = req.body;

    try {
        await req.client.deleteMessage(`${phone}@c.us`, [messageId]);
        return res.status(200).json({status: "Success", message: "Message deleted"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on delete message"});
    }
}

export async function reply(req, res) {
    const {phone, text, messageid} = req.body;

    try {
        let response = await req.client.reply(`${phone}@c.us`, text, messageid);
        return res.status(200).json({
            status: "Success",
            id: response.id,
            phone: response.chat.id.user,
            content: response.content
        });
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Success", message: "Error replying message"});
    }
}

export async function forwardMessages(req, res) {
    const {phone, messageId} = req.body;

    try {
        let response = await req.client.forwardMessages(`${phone}@c.us`, [messageId], false);
        return res.status(200).json({
            status: "Success",
            id: response.to._serialized,
            session: req.session,
            phone: response.to.remote.user,
        });
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error forwarding message"});
    }
}

export async function markUnseenMessage(req, res) {
    const {phone, isGroup = false} = req.body;

    try {
        if (isGroup) {
            await req.client.markUnseenMessage(`${phone}@g.us`);
        } else {
            await req.client.markUnseenMessage(`${phone}@c.us`);
        }
        return res.status(200).json({status: "Success", message: "unseen checked"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on mark unseen"});
    }
}

export async function blockContact(req, res) {
    const {phone} = req.body;

    try {
        await req.client.blockContact(`${phone}@c.us`);
        return res.status(200).json({status: "Success", message: "Contact blocked"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on block contact"});
    }
}

export async function unblockContact(req, res) {
    const {phone} = req.body;

    try {
        await req.client.unblockContact(`${phone}@c.us`);
        return res.status(200).json({status: "Success", message: "Contact UnBlocked"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on unlock contact"});
    }
}

export async function pinChat(req, res) {
    const {phone, state, isGroup = false} = req.body;

    try {
        if (isGroup) {
            await req.client.pinChat(`${phone}@g.us`, state === "true", false);
        } else {
            await req.client.pinChat(`${phone}@c.us`, state === "true", false);
        }

        return res.status(200).json({status: "Success", message: "Chat fixed"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error on pin chat"});
    }
}

export async function setProfilePic(req, res) {
    if (!req.file)
        return res.status(400).json({status: "Error", message: "File parameter is required!"});

    try {
        const {path: pathFile} = req.file;

        await req.client.setProfilePic(pathFile);
        await unlinkAsync(pathFile);

        return res.status(200).json({status: "Success", message: "Profile photo successfully changed"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Error", message: "Error changing profile photo"});
    }
}

export async function setGroupProfilePic(req, res) {
    const {phone} = req.body;

    if (!req.file)
        return res.status(400).json({status: "Error", message: "File parameter is required!"});

    try {
        const {path: pathFile} = req.file;

        for (const contato of contactToArray(phone, true)) {
            await req.client.setProfilePic(pathFile, contato);
        }

        await unlinkAsync(pathFile);

        return res.status(200).json({status: "Success", message: "Group profile photo successfully changed"});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Success", message: "Error changing group photo"});
    }
}

export async function getUnreadMessages(req, res) {
    const session = req.session;

    try {
        const response = await req.client.getUnreadMessages(false, false, true);
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on open list"});
    }
}

export async function getChatIsOnline(req, res) {
    const {phone} = req.params;
    try {
        const response = await req.client.getChatIsOnline(`${phone}@c.us`);
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get chat is online"});
    }
}

export async function getLastSeen(req, res) {
    const {phone} = req.params;
    try {
        const response = await req.client.getLastSeen(`${phone}@c.us`);
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get chat last seen"});
    }
}

export async function getListMutes(req, res) {
    const {type = 'all'} = req.params;
    try {
        const response = await req.client.getListMutes(type);
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on get list mutes"});
    }
}

export async function loadAndGetAllMessagesInChat(req, res) {
    const {phone, includeMe = true, includeNotifications = false} = req.params;

    try {
        const response = await req.client.loadAndGetAllMessagesInChat(`${phone}@c.us`, includeMe, includeNotifications);
        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(401).json({status: "error", response: "Error on open list"});
    }
}

export async function sendContactVcard(req, res) {
    const {phone, contactsId, isGroup = false} = req.body;

    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendContactVcard(`${contato}`, contactsId);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "error", message: "Error on send contact vcard"});
    }
}

export async function sendMentioned(req, res) {
    const session = req.session;
    const {phone, message, mentioned, isGroup = false} = req.body;

    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendMentioned(`${contato}`, message, mentioned);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on send message mentioned"});
    }
}

export async function sendMute(req, res) {
    const session = req.session;
    const {phone, time, type = 'hours', isGroup = false} = req.body;


    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendMute(`${contato}`, time, type);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on send mute"});
    }
}

export async function sendSeen(req, res) {
    const {phone, isGroup = false} = req.body;


    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendSeen(`${contato}`);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on send seen"});
    }
}

export async function setChatState(req, res) {
    const session = req.session;
    const {phone, chatstate, isGroup = false} = req.body;


    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.setChatState(`${contato}`, chatstate);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on send chat state"});
    }
}

export async function setTemporaryMessages(req, res) {
    const {phone, value = true, isGroup = false} = req.body;

    try {
        let response;
        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.setTemporaryMessages(`${contato}`, value);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on set temporary messages"});
    }
}

export async function setTyping(req, res) {
    const {phone, value = true, isGroup = false} = req.body;
    try {
        let response;

        for (const contato of contactToArray(phone, isGroup)) {
            if (value)
                response = await req.client.startTyping(contato);
            else
                response = await req.client.stopTyping(contato);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on set typing"});
    }
}

export async function checkNumberStatus(req, res) {
    const {phone} = req.params;
    try {
        let response;

        for (const contato of contactToArray(phone, false)) {
            response = await req.client.checkNumberStatus(`${contato}`);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on check number status"});
    }
}

export async function getContact(req, res) {
    const {phone = true} = req.params;
    try {
        let response;
        for (const contato of contactToArray(phone, false)) {
            response = await req.client.getContact(contato);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on get contact"});
    }
}

export async function getAllContacts(req, res) {
    try {
        const response = await req.client.getAllContacts();
        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on get all constacts"});
    }
}

export async function getNumberProfile(req, res) {
    const {phone = true} = req.params;
    try {
        let response;
        for (const contato of contactToArray(phone, false)) {
            response = await req.client.getNumberProfile(contato);
        }
        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on get number profile"});
    }
}

export async function getProfilePicFromServer(req, res) {
    const {phone = true} = req.params;
    try {
        let response;
        for (const contato of contactToArray(phone, false)) {
            response = await req.client.getProfilePicFromServer(contato);
        }

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on  get profile pic"});
    }
}

export async function getStatus(req, res) {
    const {phone = true} = req.params;
    try {
        let response;
        for (const contato of contactToArray(phone, false)) {
            response = await req.client.getStatus(contato);
        }
        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on  get status"});
    }
}

export async function setProfileStatus(req, res) {
    const {status} = req.body;

    try {
        return res.status(200).json({status: "Success", response: await req.client.setProfileStatus(status)});
    } catch (e) {
        Logger.error(e);
        return res.status(400).json({status: "Success", message: "Error on set profile status"});
    }
}

export async function starMessage(req, res) {
    const {messageId, star = true} = req.body;
    try {

        let response = await req.client.starMessage(messageId, star);

        return res.status(200).json({status: "success", response: response});
    } catch (error) {
        return res.status(400).json({status: "error", message: "Error on  start message"});
    }
}
