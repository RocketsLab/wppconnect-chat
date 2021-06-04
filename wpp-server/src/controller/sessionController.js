import {clientsArray, config} from "../util/sessionUtil";
import {callWebHook} from "../util/functions";
import CreateSessionUtil from "../util/createSessionUtil";
import getAllTokens from "../util/getAllTokens";
import Logger from "../util/logger";
import fs from "fs";
import mime from "mime-types";

const SessionUtil = new CreateSessionUtil();

async function downloadFileFunction(message, client) {
    try {
        const buffer = await client.decryptFile(message);

        let filename = `./WhatsAppImages/file${message.t}`;
        if (!fs.existsSync(filename)) {
            let result = "";
            if (message.type === "ptt") {
                result = `${filename}.oga`;
            } else {
                result = `${filename}.${mime.extension(message.mimetype)}`;
            }

            await fs.writeFile(result, buffer, (err) => {
                if (err) {
                    Logger.error(err);
                }
            });

            return result;
        } else {
            return `${filename}.${mime.extension(message.mimetype)}`;
        }
    } catch (e) {
        Logger.error(e);
        Logger.warn("Erro ao descriptografar a midia, tentando fazer o download direto...");
        try {
            const buffer = await client.downloadMedia(message);
            const filename = `./WhatsAppImages/file${message.t}`;
            if (!fs.existsSync(filename)) {
                let result = "";
                if (message.type === "ptt") {
                    result = `${filename}.oga`;
                } else {
                    result = `${filename}.${mime.extension(message.mimetype)}`;
                }

                await fs.writeFile(result, buffer, (err) => {
                    if (err) {
                        Logger.error(err);
                    }
                });

                return result;
            } else {
                return `${filename}.${mime.extension(message.mimetype)}`;
            }
        } catch (e) {
            Logger.error(e);
            Logger.warn("Não foi possível baixar a mídia...");
        }
    }
}

export async function download(message, client) {
    try {
        const path = await downloadFileFunction(message, client);
        return path.replace("./", "");
    } catch (e) {
        Logger.error(e);
    }
}

export async function startAllSessions(req, res) {
    const {secretkey} = req.params;
    const {authorization: token} = req.headers;

    let tokenDecrypt = "";

    if (secretkey === undefined) {
        tokenDecrypt = token.split(" ")[0];
    } else {
        tokenDecrypt = secretkey;
    }

    const allSessions = await getAllTokens();

    if (tokenDecrypt !== config.secretKey) {
        return res.status(400).json({
            response: false,
            message: "The token is incorrect"
        });
    }

    allSessions.map(async (session) => {
        await SessionUtil.opendata(req, session);
    });

    return await res.status(201).json({status: "Success", message: "Starting all sessions"});
}

export async function startSession(req, res) {
    const session = req.session;
    const {waitQrCode = false} = req.body;

    await getSessionState(req, res);
    await SessionUtil.opendata(req, session, waitQrCode ? res : null);
}

export async function closeSession(req, res) {
    const session = req.session;
    try {
        clientsArray[session] = {status: null};
        await req.client.close();

        req.io.emit("whatsapp-status", false);
        callWebHook(req.client, "closesession", {"message": `Session: ${session} disconnected`, connected: false});

        return await res.status(200).json({status: true, message: "Session successfully closed"});
    } catch (error) {
        return await res.status(400).json({status: false, message: "Error closing session", error});
    }

}

export async function logOutSession(req, res) {
    try {
        const session = req.session;
        await req.client.logout();

        req.io.emit("whatsapp-status", false);
        callWebHook(req.client, "logoutsession", {"message": `Session: ${session} logged out`, connected: false});

        return await res.status(200).json({status: true, message: "Session successfully closed"});
    } catch (error) {
        return await res.status(400).json({status: false, message: "Error closing session", error});
    }
}

export async function checkConnectionSession(req, res) {
    try {
        await req.client.isConnected();

        return res.status(200).json({status: true, message: "Connected"});
    } catch (error) {
        return res.status(200).json({status: false, message: "Disconnected"});
    }
}

export async function showAllSessions(req, res) {
    const arr = [];
    Object.keys(clientsArray).forEach((item) => {
        arr.push({session: item})
    });

    return res.status(200).json({response: arr});
}

export async function downloadMediaByMessage(req, res) {
    const {messageId} = req.body;

    let result = "";

    if (messageId.isMedia === true) {
        await download(messageId, req.client);
        result = `${config.host}:${config.port}/files/file${messageId.t}.${mime.extension(messageId.mimetype)}`;
    } else if (messageId.type === "ptt" || messageId.type === "sticker") {
        await download(messageId, req.client);
        result = `${config.host}:${config.port}/files/file${messageId.t}.${mime.extension(messageId.mimetype)}`;
    }

    return res.status(200).json(result);
}

export async function getMediaByMessage(req, res) {
    const client = req.client;
    const {messageId} = req.params;

    try {
        const message = await client.getMessageById(messageId);

        if (!message)
            return res.status(400).json(
                {
                    response: false,
                    message: "Message not found"
                });

        if (!(message['mimetype'] || message.isMedia || message.isMMS))
            return res.status(400).json(
                {
                    response: false,
                    message: "Message does not contain media"
                });


        const buffer = await client.decryptFile(message);

        return res.status(200).json(await buffer.toString('base64'));
    } catch (ex) {
        Logger.error(ex);
        return res.status(400).json({
            response: false,
            message: "The session is not active"
        });
    }
}

export async function getSessionState(req, res) {
    try {
        const {waitQrCode = false} = req.body;
        const client = req.client;

        if ((client == null || client.status == null) && !waitQrCode)
            return res.status(200).json({status: 'CLOSED', qrcode: null});
        else if (client != null)
            return res.status(200).json({status: client.status, qrcode: client.qrcode, urlcode: client.urlcode});

    } catch (ex) {
        Logger.error(ex);
        return res.status(400).json({
            response: false,
            message: "The session is not active"
        });
    }
}

export async function getQrCode(req, res) {
    try {
        const img = Buffer.from(req.client.qrcode.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64');

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        });
        res.end(img);
    } catch (ex) {
        Logger.error(ex);
        return res.status(400).json({
            response: false,
            message: "Error retrieving QRCode"
        });
    }
}

export async function killServiceWorker(req, res) {
    try {
        return res.status(200).json({status: "success", response: req.client.killServiceWorker()});

    } catch (ex) {
        Logger.error(ex);
        return res.status(400).json({
            response: false,
            message: "The session is not active"
        });
    }


}

export async function restartService(req, res) {
    try {
        return res.status(200).json({status: "success", response: req.client.restartService()});
    } catch (ex) {
        Logger.error(ex);
        return res.status(400).json({
            response: false,
            message: "The session is not active"
        });
    }
}

export async function subscribePresence(req, res) {
    try {
        const {phone, isGroup = false, all = false} = req.body;

        if (all) {
            let contacts;
            if (isGroup) {
                const groups = await req.client.getAllGroups(false);
                contacts = groups.map((p) => p.id._serialized);
            } else {
                const chats = await req.client.getAllContacts();
                contacts = chats.map((c) => c.id._serialized);
            }
            await req.client.subscribePresence(contacts);
        } else
            for (const contato of contactToArray(phone, isGroup)) {
                await req.client.subscribePresence(contato);
            }

        return await res.status(200).json({status: true, message: "Subscribe presence executed"});
    } catch (error) {
        return await res.status(400).json({status: false, message: "Error on subscribe presence", error});
    }
}