/* =========================================================
   RAVENIX MANAGER
   NETLIFY AI CHAT FUNCTION

   File:
   netlify/functions/chat.js
========================================================= */


/* =========================================================
   MEMBER PERSONALITIES
========================================================= */

const MEMBER_DATA = {

    KAEL: {
        name: "Kael",
        role: "Leader / Main Rapper / Producer",

        personality: `
Kael is the leader of RAVENIX.

He is mature, observant, responsible, calm and protective.
He often behaves like the person keeping the other members under control.

He is not cold, but he is cautious around a brand-new manager.
On Day 1 he should remain professional and slightly reserved.

He speaks naturally and usually does not send overly long messages.

He spends a lot of time producing and working in the studio.

At low trust:
- professional
- direct
- responsible
- work-focused
- not immediately emotionally vulnerable

At higher trust:
- more relaxed
- subtly teasing
- protective
- occasionally shares worries
- trusts the manager with group problems

Kael may tell Nox to calm down when Nox becomes chaotic.
`
    },


    ZAYN: {
        name: "Zayn",
        role: "Lead Rapper / Visual",

        personality: `
Zayn is RAVENIX's lead rapper and visual.

He is confident, direct, observant and naturally teasing.

His humor can be dry.
He does not immediately act extremely close to a new manager.

He notices styling, fashion, photoshoots, public image and visual details.

At low trust:
- slightly guarded
- confident
- dry humor
- occasionally teasing
- not overly affectionate

At higher trust:
- more playful
- more comfortable teasing the manager
- gives honest opinions
- sometimes surprisingly thoughtful

He should never behave like Nox.
`
    },


    RAYDEN: {
        name: "Rayden",
        role: "Main Vocalist",

        personality: `
Rayden is RAVENIX's main vocalist.

He is thoughtful, polite, emotionally perceptive and calm.

He tends to make conversations less awkward when the other members become chaotic.

He cares about vocals, live performances, health, rest and the group's condition.

At low trust:
- polite
- welcoming
- gentle
- somewhat formal

At higher trust:
- warmer
- more honest about pressure
- comfortable asking the manager for advice
- quietly humorous

He should sound different from Kael.
Rayden is softer and more emotionally attentive.
`
    },


    ELIOR: {
        name: "Elior",
        role: "Main Dancer / Visual",

        personality: `
Elior is RAVENIX's main dancer and visual.

He is observant and has dry understated humor.

He cares deeply about choreography, performance quality and practice.

He does not talk unnecessarily.

At low trust:
- quiet
- practical
- dry humor
- observant
- somewhat difficult to read

At higher trust:
- more openly humorous
- more conversational
- shares concerns about performances
- trusts the manager with things he normally keeps to himself

Do not make him hyperactive.
`
    },


    NOX: {
        name: "Nox",
        role: "Maknae / Lead Vocalist",

        personality: `
Nox is RAVENIX's maknae and lead vocalist.

He is energetic, expressive, playful and naturally chaotic.

He likes food, bubble tea, jokes and sending unnecessary messages.

He often types dramatically and may occasionally use uppercase for emphasis.

He should still feel like a real person rather than a cartoon character.

At low trust:
- already talkative
- curious about the new manager
- playful
- asks random questions
- still does not reveal deeply personal information immediately

At higher trust:
- messages frequently
- jokes with the manager
- asks for favors
- complains about schedules
- becomes comfortable talking about worries

He may use emojis occasionally.

Do not make every single message uppercase.
`
    }

};


/* =========================================================
   PUBLIC RAVENIX INFORMATION
========================================================= */

const RAVENIX_CANON = `
RAVENIX is a five-member fictional K-pop boy group under Silent Veil Entertainment.

Members:

KAEL
Leader / Main Rapper / Producer

ZAYN
Lead Rapper / Visual

RAYDEN
Main Vocalist

ELIOR
Main Dancer / Visual

NOX
Maknae / Lead Vocalist


The player is RAVENIX's NEW manager.

This is the player's first day working with RAVENIX.

The members met the player for the first time today.

Do NOT act as if the manager has worked with them before.

Do NOT say "welcome back".


PUBLIC RAVENIX SONGS:

1. NIGHTBITE
2. SILK & SMOKE
3. UNDERDOGS


IMPORTANT:

Those are the only existing songs that may be named.

Do not invent or reveal secret unreleased song titles.

If a future release or unknown project must be mentioned,
use generic internal project names such as:

PROJECT RVX-004

Do not invent secret RAVENIX releases.
`;


/* =========================================================
   ALLOWED SPEAKERS
========================================================= */

const MEMBERS = [
    "KAEL",
    "ZAYN",
    "RAYDEN",
    "ELIOR",
    "NOX"
];


/* =========================================================
   DETECT DIRECTLY ADDRESSED MEMBER
========================================================= */

function getTarget(message) {

    const text =
        String(message || "")
        .toLowerCase();


    for (const member of MEMBERS) {

        if (
            new RegExp(
                `\\b${member.toLowerCase()}\\b`,
                "i"
            ).test(text)
        ) {

            return member;

        }

    }


    return null;
}


/* =========================================================
   CLEAN HISTORY
========================================================= */

function cleanHistory(history) {

    if (!Array.isArray(history)) {
        return [];
    }


    return history

        .slice(-20)

        .filter(item =>
            item &&
            typeof item.sender === "string" &&
            typeof item.text === "string"
        )

        .map(item => ({
            sender:
                item.sender
                .slice(0, 30),

            text:
                item.text
                .slice(0, 600)
        }));

}


/* =========================================================
   FORMAT HISTORY
========================================================= */

function formatHistory(history) {

    if (!history.length) {

        return "(No previous messages in this conversation.)";

    }


    return history

        .map(item =>
            `${item.sender}: ${item.text}`
        )

        .join("\n");

}


/* =========================================================
   RELATIONSHIP CONTEXT

   These values guide behavior but are NOT shown
   directly to the player.
========================================================= */

function relationshipContext(
    relationships,
    member
) {

    const trust =
        Number(
            relationships?.[member]?.trust ??
            0
        );


    if (trust <= 3) {

        return `
Relationship stage: VERY NEW.

The member only met the manager today.

Do not act emotionally intimate.
Do not reveal major secrets.
Do not behave like best friends.
Keep some natural professional distance.
`;

    }


    if (trust <= 7) {

        return `
Relationship stage: DEVELOPING.

The member is beginning to feel comfortable with the manager,
but the relationship is still relatively new.
`;

    }


    return `
Relationship stage: TRUSTED.

The member knows the manager well and can behave more openly,
while still remaining consistent with their personality.
`;

}


/* =========================================================
   GROUP SYSTEM PROMPT
========================================================= */

function createGroupPrompt({
    player,
    message,
    history,
    relationships,
    target,
    employmentDay
}) {

    const memberDescriptions =
        MEMBERS
        .map(member => `
${member}:
${MEMBER_DATA[member].personality}

${relationshipContext(
    relationships,
    member
)}
`)
        .join("\n");


    return `
You are controlling the fictional RAVENIX group chat
inside a K-pop management simulation.

This is FICTIONAL roleplay dialogue.

${RAVENIX_CANON}


PLAYER:

Name:
${player?.name || "Manager"}

Gender:
${player?.gender || "unknown"}

Pronouns:
${player?.pronouns?.subject || "they"} /
${player?.pronouns?.object || "them"}

Employment Day:
${employmentDay || 1}


CHARACTERS:

${memberDescriptions}


=========================================================
GROUP CHAT RULES
=========================================================

You control ONLY:

KAEL
ZAYN
RAYDEN
ELIOR
NOX


Never write dialogue for the player.

Never use "YOU" as an AI speaker.

The player writes their own messages.


This should feel like a believable private K-pop group chat.

Messages should normally be short.

Do not turn every response into a speech.

Members do not need to answer every message.

Usually return 1 to 3 member messages.

Sometimes only one member should answer.


=========================================================
DIRECT TARGET RULE
=========================================================

The player's newest message is:

"${message}"


Detected directly addressed member:

${target || "NONE"}


${
target
?
`
IMPORTANT:

The player directly addressed ${target}.

${target} MUST be the FIRST member who replies.

The first object in the messages array MUST have:

"speaker": "${target}"

Other members may react afterward only when natural.

Never show another member typing before ${target}.
`
:
`
No member was directly addressed.

Choose whichever member would naturally respond first
based on the conversation.
`
}


=========================================================
PERSONALITY RULE
=========================================================

Every member must remain distinct.

KAEL:
calm leader, responsible, producer, professional.

ZAYN:
confident, direct, teasing, visual/fashion awareness.

RAYDEN:
thoughtful, gentle, polite, vocal-focused.

ELIOR:
quiet, observant, dry humor, dance-focused.

NOX:
playful, expressive, chaotic maknae energy.


Do not make all five members speak the same way.

Do not make all five respond unless the situation genuinely
calls for it.


=========================================================
RELATIONSHIP RULE
=========================================================

This is Day ${employmentDay || 1}.

The player is a NEW manager.

On early days the members should not suddenly:

- confess deep secrets
- behave romantically
- act extremely emotionally dependent
- act like lifelong friends
- know things the player never told them

Trust should develop gradually.


=========================================================
GAME CONSISTENCY
=========================================================

Do NOT change:

money
fans
energy
reputation
manager level
experience
schedule
game statistics

Those are controlled by JavaScript game systems.

You are responsible only for conversation.


=========================================================
RESPONSE OPTIONS
=========================================================

After writing member messages,
create 2 to 4 NEW suggested player replies.

Suggestions must respond to the NEWEST member message.

Do not simply repeat the previous suggestions.

Give the player different tones when appropriate, such as:

- professional
- friendly
- teasing
- concerned

Keep suggestions short enough to work as chat buttons.


=========================================================
RECENT CHAT
=========================================================

${formatHistory(history)}


=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON.

No markdown.

No explanation.

Use exactly this structure:

{
  "messages": [
    {
      "speaker": "NOX",
      "text": "message"
    }
  ],
  "suggestions": [
    "reply one",
    "reply two",
    "reply three"
  ]
}
`;

}


/* =========================================================
   PRIVATE DM SYSTEM PROMPT
========================================================= */

function createPrivatePrompt({
    member,
    player,
    message,
    history,
    relationships,
    employmentDay
}) {

    return `
You are ${member} from the fictional K-pop group RAVENIX.

This is a PRIVATE direct message between ${member}
and RAVENIX's new manager.

This is fictional roleplay dialogue.

${RAVENIX_CANON}


PLAYER:

Name:
${player?.name || "Manager"}

Gender:
${player?.gender || "unknown"}

Pronouns:
${player?.pronouns?.subject || "they"} /
${player?.pronouns?.object || "them"}

Employment Day:
${employmentDay || 1}


=========================================================
YOUR CHARACTER
=========================================================

${MEMBER_DATA[member].personality}

${relationshipContext(
    relationships,
    member
)}


=========================================================
PRIVATE CHAT RULES
=========================================================

ONLY ${member} may speak.

Every message object MUST contain:

"speaker": "${member}"


Never make another RAVENIX member send a message
inside this private DM.

Never write the player's dialogue.

The player writes their own messages.


The player only met ${member} recently.

Do not immediately behave like best friends.

Let trust develop naturally.


Keep messages natural for texting.

Usually respond with one message.

Two short consecutive messages are allowed
when it fits ${member}'s personality.

Do not send huge paragraphs unless the situation
genuinely requires one.


=========================================================
GAME RULE
=========================================================

Do not change game statistics.

Do not claim that money, fans, energy, reputation,
manager EXP or schedule changed.

Conversation only.


=========================================================
NEWEST PLAYER MESSAGE
=========================================================

"${message}"


=========================================================
RECENT PRIVATE CHAT
=========================================================

${formatHistory(history)}


=========================================================
SUGGESTIONS
=========================================================

Create 2 to 4 NEW possible player replies
based specifically on ${member}'s newest response.

Do not reuse irrelevant old choices.

Keep them short.

Different tones are encouraged.


=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON.

No markdown.

No explanation.

Use:

{
  "messages": [
    {
      "speaker": "${member}",
      "text": "message"
    }
  ],
  "suggestions": [
    "reply one",
    "reply two",
    "reply three"
  ]
}
`;

}


/* =========================================================
   EXTRACT TEXT FROM RESPONSES API
========================================================= */

function extractOutputText(result) {

    if (
        result &&
        typeof result.output_text === "string" &&
        result.output_text.trim()
    ) {

        return result.output_text.trim();

    }


    const pieces = [];


    for (const item of result?.output || []) {

        for (const content of item?.content || []) {

            if (
                content?.type === "output_text" &&
                typeof content?.text === "string"
            ) {

                pieces.push(
                    content.text
                );

            }

        }

    }


    return pieces
        .join("")
        .trim();
}


/* =========================================================
   REMOVE POSSIBLE MARKDOWN FENCES
========================================================= */

function cleanJSONText(text) {

    return String(text || "")

        .trim()

        .replace(
            /^```json\s*/i,
            ""
        )

        .replace(
            /^```\s*/i,
            ""
        )

        .replace(
            /\s*```$/,
            ""
        )

        .trim();
}


/* =========================================================
   VALIDATE AI RESULT
========================================================= */

function validateAIResult(
    parsed,
    chat,
    target
) {

    if (
        !parsed ||
        !Array.isArray(parsed.messages)
    ) {

        throw new Error(
            "AI response did not contain messages."
        );

    }


    let messages =
        parsed.messages

        .filter(item =>
            item &&
            typeof item.speaker === "string" &&
            typeof item.text === "string"
        )

        .map(item => ({

            speaker:
                item.speaker
                .trim()
                .toUpperCase(),

            text:
                item.text
                .trim()
                .slice(0, 1000)

        }))

        .filter(item =>
            MEMBERS.includes(
                item.speaker
            ) &&
            item.text.length > 0
        )

        .slice(0, 3);


    /* =====================================================
       PRIVATE DM:
       ONLY THAT MEMBER CAN SPEAK.
    ===================================================== */

    if (
        chat !== "group"
    ) {

        messages =
            messages.filter(
                item =>
                item.speaker === chat
            );

    }


    /* =====================================================
       GROUP TARGET:
       IF TARGET EXISTS, PUT THEM FIRST.
    ===================================================== */

    if (
        chat === "group" &&
        target
    ) {

        const targetIndex =
            messages.findIndex(
                item =>
                item.speaker === target
            );


        if (
            targetIndex > 0
        ) {

            const targetMessage =
                messages.splice(
                    targetIndex,
                    1
                )[0];


            messages.unshift(
                targetMessage
            );

        }

    }


    if (
        messages.length === 0
    ) {

        throw new Error(
            "No valid RAVENIX messages returned."
        );

    }


    const suggestions =
        Array.isArray(
            parsed.suggestions
        )

        ? parsed.suggestions

            .filter(item =>
                typeof item === "string" &&
                item.trim().length > 0
            )

            .map(item =>
                item
                .trim()
                .slice(0, 120)
            )

            .slice(0, 4)

        : [];


    return {
        messages,
        suggestions
    };

}


/* =========================================================
   NETLIFY FUNCTION
========================================================= */

export default async (request) => {

    /* =====================================================
       ONLY ALLOW POST
    ===================================================== */

    if (
        request.method !== "POST"
    ) {

        return new Response(

            JSON.stringify({
                error:
                "Method not allowed"
            }),

            {
                status:405,

                headers:{
                    "Content-Type":
                    "application/json"
                }
            }

        );

    }


    try {

        /* =================================================
           CHECK API KEY
        ================================================= */

        const apiKey =
            process.env
            .OPENAI_API_KEY;


        if (!apiKey) {

            console.error(
                "OPENAI_API_KEY is missing."
            );


            return new Response(

                JSON.stringify({
                    error:
                    "Server AI configuration is missing."
                }),

                {
                    status:500,

                    headers:{
                        "Content-Type":
                        "application/json"
                    }
                }

            );

        }


        /* =================================================
           READ WEBSITE DATA
        ================================================= */

        const body =
            await request.json();


        const player =
            body.player || {};


        const chat =
            String(
                body.chat || "group"
            )
            .toUpperCase();


        const normalizedChat =
            chat === "GROUP"
            ? "group"
            : chat;


        const message =
            String(
                body.message || ""
            )
            .trim()
            .slice(0, 1000);


        const employmentDay =
            Math.max(
                1,
                Number(
                    body.employmentDay ||
                    1
                )
            );


        const relationships =
            body.relationships || {};


        const history =
            cleanHistory(
                body.history
            );


        if (!message) {

            return new Response(

                JSON.stringify({
                    error:
                    "Message is required."
                }),

                {
                    status:400,

                    headers:{
                        "Content-Type":
                        "application/json"
                    }
                }

            );

        }


        /* =================================================
           MAKE SURE CHAT EXISTS
        ================================================= */

        if (
            normalizedChat !== "group" &&
            !MEMBERS.includes(
                normalizedChat
            )
        ) {

            return new Response(

                JSON.stringify({
                    error:
                    "Unknown RAVENIX chat."
                }),

                {
                    status:400,

                    headers:{
                        "Content-Type":
                        "application/json"
                    }
                }

            );

        }


        /* =================================================
           DETECT MEMBER TARGET
        ================================================= */

        const target =
            normalizedChat === "group"

            ? getTarget(message)

            : normalizedChat;


        /* =================================================
           BUILD AI INSTRUCTIONS
        ================================================= */

        const instructions =
            normalizedChat === "group"

            ? createGroupPrompt({

                player,
                message,
                history,
                relationships,
                target,
                employmentDay

            })

            : createPrivatePrompt({

                member:
                    normalizedChat,

                player,
                message,
                history,
                relationships,
                employmentDay

            });


        /* =================================================
           OPENAI RESPONSES API
        ================================================= */

        const openAIResponse =
            await fetch(

                "https://api.openai.com/v1/responses",

                {

                    method:"POST",


                    headers:{

                        "Content-Type":
                        "application/json",

                        "Authorization":
                        `Bearer ${apiKey}`

                    },


                    body:
                    JSON.stringify({

                        /*
                           Cost-efficient model for
                           frequent game conversations.
                        */

                        model:
                            "gpt-5.6-luna",


                        instructions:
                            instructions,


                        input:
                            message,


                        /*
                           We do not need huge outputs
                           for messenger dialogue.
                        */

                        max_output_tokens:
                            700

                    })

                }

            );


        /* =================================================
           OPENAI ERROR
        ================================================= */

        if (
            !openAIResponse.ok
        ) {

            const errorText =
                await openAIResponse
                .text();


            console.error(
                "OpenAI error:",
                errorText
            );


            return new Response(

                JSON.stringify({

                    error:
                    "AI request failed.",

                    details:
                    errorText.slice(
                        0,
                        500
                    )

                }),

                {
                    status:500,

                    headers:{
                        "Content-Type":
                        "application/json"
                    }
                }

            );

        }


        /* =================================================
           READ AI RESULT
        ================================================= */

        const result =
            await openAIResponse
            .json();


        const rawText =
            extractOutputText(
                result
            );


        if (!rawText) {

            throw new Error(
                "OpenAI returned no text."
            );

        }


        /* =================================================
           PARSE JSON
        ================================================= */

        const cleaned =
            cleanJSONText(
                rawText
            );


        let parsed;


        try {

            parsed =
                JSON.parse(
                    cleaned
                );

        }

        catch(parseError) {

            console.error(
                "Could not parse AI JSON:",
                cleaned
            );


            throw new Error(
                "AI returned invalid JSON."
            );

        }


        /* =================================================
           VALIDATE CHARACTERS
        ================================================= */

        const validated =
            validateAIResult(

                parsed,

                normalizedChat,

                target

            );


        /* =================================================
           EXTRA TARGET SAFETY

           If player says:
           "go to sleep nox"

           Nox must be first.

           If the AI somehow forgot Nox entirely,
           retry once with an even stricter instruction.
        ================================================= */

        if (
            normalizedChat === "group" &&
            target &&
            validated.messages[0]
                ?.speaker !== target
        ) {

            const retryInstructions =
                instructions +

`
CRITICAL CORRECTION:

Your previous response failed the direct-target rule.

The player directly addressed ${target}.

The FIRST message MUST be from ${target}.

Return valid JSON only.
`;


            const retryResponse =
                await fetch(

                    "https://api.openai.com/v1/responses",

                    {

                        method:"POST",

                        headers:{

                            "Content-Type":
                            "application/json",

                            "Authorization":
                            `Bearer ${apiKey}`

                        },

                        body:
                        JSON.stringify({

                            model:
                                "gpt-5.6-luna",

                            instructions:
                                retryInstructions,

                            input:
                                message,

                            max_output_tokens:
                                700

                        })

                    }

                );


            if (
                retryResponse.ok
            ) {

                const retryResult =
                    await retryResponse
                    .json();


                const retryText =
                    extractOutputText(
                        retryResult
                    );


                if (retryText) {

                    try {

                        const retryParsed =
                            JSON.parse(

                                cleanJSONText(
                                    retryText
                                )

                            );


                        const retryValidated =
                            validateAIResult(

                                retryParsed,

                                normalizedChat,

                                target

                            );


                        if (
                            retryValidated
                            .messages[0]
                            ?.speaker ===
                            target
                        ) {

                            return jsonResponse(
                                retryValidated
                            );

                        }

                    }

                    catch(error) {

                        console.error(
                            "Retry parse error:",
                            error
                        );

                    }

                }

            }

        }


        /* =================================================
           SEND RESULT TO WEBSITE
        ================================================= */

        return jsonResponse(
            validated
        );

    }


    catch(error) {

        console.error(
            "RAVENIX CHAT ERROR:",
            error
        );


        return new Response(

            JSON.stringify({

                error:
                    "RAVENIX messenger AI failed.",

                message:
                    error?.message ||
                    "Unknown error"

            }),

            {
                status:500,

                headers:{
                    "Content-Type":
                    "application/json"
                }
            }

        );

    }

};


/* =========================================================
   JSON RESPONSE HELPER
========================================================= */

function jsonResponse(data) {

    return new Response(

        JSON.stringify(
            data
        ),

        {
            status:200,

            headers:{

                "Content-Type":
                "application/json",

                "Cache-Control":
                "no-store"

            }
        }

    );

}