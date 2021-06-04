import {contactToArray, strToBool, unlinkAsync} from "../util/functions";
import Logger from "../util/logger";

function returnError(res, session, error) {
    Logger.error(error);
    res.status(400).json({
        response: {
            message: "Message was not sent.",
            session: session,
            log: error
        },
    });
}

function returnSucess(res, session, phone, data) {
    res.status(201).json({
        response: {
            message: "Message sent successfully",
            contact: phone,
            session: session,
            data: data
        },
    });
}

export async function sendMessage(req, res) {
    const session = req.session;
    const {phone, message, isGroup = false} = req.body;

    try {
        let result;
        for (const contato of contactToArray(phone, isGroup)) {
            result = await req.client.sendText(`${contato}`, message);
        }

        if (!result)
            return res.status(400).json("Error sending message");

        req.io.emit("mensagem-enviada", {message: message, to: phone});
        returnSucess(res, session, phone, result);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendImage(req, res) {
    const session = req.session;
    const {phone, caption, path, isGroup = false} = req.body;

    if (!phone)
        return res.status(401).send({message: "Telefone não informado."});

    if (!path)
        return res.status(401).send({
            message: "Informe o caminho da imagem. Exemplo: C:\\folder\\image.jpg."
        });

    try {

        for (const contato of contactToArray(phone, isGroup)) {
            await req.client.sendImage(contato, path, "image-api.jpg", caption);
        }

        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendFile(req, res) {
    const session = req.session;
    const {phone, filename = "file", message, isGroup = false} = req.body;

    if (!req.file)
        return res.status(400).json({status: "Error", message: "Sending the file is mandatory"});

    const {path: pathFile} = req.file;

    try {
        for (const contato of contactToArray(phone, strToBool(isGroup))) {
            await req.client.sendFile(`${contato}`, pathFile, filename, message);
        }

        await unlinkAsync(pathFile);
        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendFile64(req, res) {
    const session = req.session;
    const {base64, phone, filename = "file", message, isGroup = false} = req.body;

    if (!base64)
        return res.status(401).send({message: "The base64 of the file was not informed"});

    try {
        for (const contato of contactToArray(phone, isGroup)) {
            await req.client.sendFileFromBase64(`${contato}`, base64, filename, message);
        }

        returnSucess(res, session, phone);
    } catch (error) {
        returnError(res, session, error);
    }
}

export async function sendVoice(req, res) {
    const {phone, url: base64Ptt, isGroup = false} = req.body;

    try {
        for (const contato of contactToArray(phone, isGroup)) {
            await req.client.sendPttFromBase64(`${contato}`, base64Ptt, "Voice Audio");
        }

        return res.status(200).json("success");
    } catch (e) {
        console.log(e);
        return res.status(400).json({status: "FAIL"});
    }
}

export async function sendLinkPreview(req, res) {
    const {phone, url, caption, isGroup = false} = req.body;

    try {
        let response = {};

        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendLinkPreview(`${contato}`, url, caption);
        }

        return res.status(200).json({status: "Success", message: "Lind send"});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Error on send link", log: error});
    }
}

export async function sendLocation(req, res) {
    const {phone, lat, lng, title, isGroup = false} = req.body;

    try {
        let response = {};

        for (const contato of contactToArray(phone, isGroup)) {
            response = await req.client.sendLocation(`${contato}`, lat, lng, title);
        }

        return res.status(200).json({status: "Success", message: "Location sent"});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Error on send location"});
    }
}

export async function sendStatusText(req, res) {
    const {message} = req.body;

    try {
        await req.client.sendText("status@broadcast", message);
        return res.status(200).json({status: "Success", message: "Location sent."});
    } catch (error) {
        Logger.error(error);
        return res.status(400).json({status: "Error on send location"});
    }
}

export async function replyMessage(req, res) {
    const session = req.session;
    const {phone, message, messageId, isGroup = false} = req.body;


    try {
        let result;
        for (const contato of contactToArray(phone, isGroup)) {
            result = await req.client.reply(`${contato}`, message, messageId);
        }

        if (!result)
            return res.status(400).json("Error sending message");

        req.io.emit("mensagem-enviada", {message: message, to: phone});
        returnSucess(res, session, phone, result);
    } catch (error) {
        returnError(res, session, error);
    }
}