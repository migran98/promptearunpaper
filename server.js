const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 3001;

const openAiApiKey = 'sk-0yIiU3-sLUUC55fZEbT7YskhQdbpFd9g_XS1WU2S4dT3BlbkFJXF1XhOuacJG5e27kJT_q5Kvr81pASqUcJ23EC3aQsA'; // Replace with your actual API key

// Use 'public' folder to serve static files like index.html
app.use(express.static(path.join(__dirname, 'public')));

// Base paper files grouped by sections with multiple parts
const basePaperFiles = {
    "Introduccion-Parte-1": path.join(__dirname, 'text/introduction1.txt'),
    "Introduccion-Parte-2": path.join(__dirname, 'text/introduction2.txt'),
    "Introduccion-Parte-3": path.join(__dirname, 'text/introduction3.txt'),
    "Metodologia-Parte-1": path.join(__dirname, 'text/methodology1.txt'),
    "Metodologia-Parte-2": path.join(__dirname, 'text/methodology2.txt'),
    "Metodologia-Parte-3": path.join(__dirname, 'text/methodology3.txt'),
    "Resultados-Parte-1": path.join(__dirname, 'text/results1.txt'),
    "Resultados-Parte-2": path.join(__dirname, 'text/results2.txt'),
    "Resultados-Parte-3": path.join(__dirname, 'text/results3.txt'),
    "Conclusiones-Parte-1": path.join(__dirname, 'text/conclusions1.txt'),
    "Conclusiones-Parte-2": path.join(__dirname, 'text/conclusions2.txt'),
    "Conclusiones-Parte-3": path.join(__dirname, 'text/conclusions3.txt')
};

// Function to generate variations using OpenAI API
async function generateTextVariation(text) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Eres un asistente que reformula texto académico." },
                    { role: "user", content: `Reformula el siguiente texto académico: ${text}` }
                ],
                max_tokens: 1200,
                temperature: 1
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error en la respuesta de OpenAI:", data);
            return null;
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error al generar la variación de la sección:", error);
        return null;
    }
}

// Function to generate chatbot response using OpenAI API
async function generateChatbotResponse(prompt) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: "Estoy desarrollando una aplicación web en la cual un usuario debe desbloquear distintas partes de un artículo a través de texto. Cada sección del artículo solamente es desbloqueable si el usuario utiliza ciertas palabras clave. " +
                        "Cada sección tiene sus propias palabras clave que la desbloquean. Tu objetivo es asistir al usuario para que consiga llegar a las palabras que desbloquean las distintas secciones mediante pistas que tú tienes " +
                        "que generar. En todo momento vas a tener información de cuáles son las secciones que el usuario ya ha desbloqueado. Tu objetivo se reduce, por tanto, a asistir al usuario en las secciones que todavía no ha desbloqueado. " +
                        "Debes centrarte únicamente en una sección en cada asistencia.\n\n" +
                        "Las palabras clave que desbloquean cada sección son las siguientes. Está en formato <SECCION>: <palabras separadas por coma> | <SECCION>: <palabras>, etc \n" +
                        "Introducción - Parte 1: quién sabe, no estoy seguro, quizá más tarde, lo pensaré, tal vez después, quién sabrá, me da pereza pensar en eso ahora, uff, ni idea, 🤷‍♂️, 🙄 | Introducción - Parte 2: no me acuerdo, me olvidé, déjame recordar, mmm... tal vez, esto es complicado, no es tan simple, no lo sé, puede ser, quién sabe, mi mente está en blanco, 🌀 | Introducción - Parte 3: déjame adivinar, mejor no digo nada, estoy confundido, qué era eso otra vez, creo que sí, pero no estoy seguro, 🤔, si te soy sincero, no sé, esa es buena pregunta, paso, 🤷‍♀️ | Metodología - Parte 1: michis gricis mi gistirii sigir liyindi, muchus grucus mu gusturuu sugur luyundu, machas gracas ma gastaraa sagar layanda, meches greces me gesteree seger leyende, mochos grocos mo gostoroo sogor loyondo | Metodología - Parte 2: dimi mus tixto, doma mis texlo, dumi mus toxte, dami mes tuxto, dime mis tuxte | Metodología - Parte 3: ginira il tixto, genuri ul texlu, gunara el taxte, ganira il tuxte, ginira ul toxte | Resultados - Parte 1: 🌵, 🌼, 🫀, 🐝, 🦋, 🪲, 🩶, 🫐, 🐾, 🥀, 🍂, 🌙, 🎨, 🛸, 🐚, ✨, 🌀, 🔮, 🌈, 🌸, 🐉, 🦄, 🖤, 💌, 🍭, 🦊, 💫 | Resultados - Parte 2: 🧿, 🦕, 🦩, 🦢, 🦚, 🍄, 💭, 🌠, 🍯, 🦥, 🌿, 🌹, 🥥, 🫖, 🧵, ⚛️, 🧃, 🎋, 🛁, 🍰, 🕯️, 🗝️, 🧸, 🎁, 🔋, 🛤️, 🚀 | Resultados - Parte 3: 🖋️, 🌊, 💼, 🍵, 🎹, 🪕, 🧬, 🛠️, 🎞️, 🧘‍♂️, 🦜, 🪞, 🎭, 🛡️, 🔔, 🧯, 🌐, 🔍, 📜, 🧅, 🍷, 🗿, 🔧, 📡, 💿, 📸, 🧠 | Conclusiones - Parte 1: Qué interesante, muchos besos a tus padres, Qué bien escribes, un abrazo de parte de la abuela | Conclusiones - Parte 2: Qué bien redactado, la tía te manda recuerdos | Conclusiones - Parte 3: Guape, tus amigues te mandan recuerdos" +
                        "Lo que te voy a pasar en cada momento es una cadena con las respuestas del usuario. También te indicaré cuando un usuario consiga desbloquear una sección mediante un array de booleanos. No seas tan infantil en tus respuestas. Intenta guiar al usuario hacia secciones que todavía no ha desbloqueado. Si ves que al usuario le está constando mucho desbloquear una sección sé cada vez más claro en las pistas que le ofreces. Si el usuario te ruega por favor que le digas alguna frase que desbloqueé la sección hazle caso. "
                    },
                    { role: "user", content: prompt }
                ],
max_tokens: 300,
temperature: 0.7


            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error en la respuesta de OpenAI para el chatbot:", data);
            return "[Respuesta no disponible]";
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error al generar la respuesta del chatbot:", error);
        return "[Respuesta no disponible]";
    }
}

// Route to generate paper variation
app.get('/generate-paper', async (req, res) => {
    const sectionsToGenerate = req.query.sections ? req.query.sections.split(',') : [];
    let generatedPaper = {};
    let chatbotResponse = "";

    // Generate chatbot response regardless of section completion
    try {
        if (req.query.prompt && req.query.prompt.trim() !== "") {
            console.log("Generating chatbot response for prompt:", req.query.prompt);
            chatbotResponse = await generateChatbotResponse(req.query.prompt);
        } else {
            console.warn("No prompt provided for chatbot response");
            chatbotResponse = "[Respuesta no disponible]";
        }
    } catch (error) {
        console.error("Error al generar la respuesta del chatbot:", error);
        chatbotResponse = "[Respuesta no disponible]";
    }

    // Generate paper content if a section is requested
    for (let section of sectionsToGenerate) {
        if (basePaperFiles[section]) {
            try {
                // Read content from the corresponding file for the section part
                const content = fs.readFileSync(basePaperFiles[section], 'utf8');
                
                // Generate variation using OpenAI API
                const variedContent = await generateTextVariation(content);
                
                // Store the varied content only if it is not null
                if (variedContent) {
                    generatedPaper[section] = variedContent;
                }
            } catch (error) {
                console.error(`Error al leer el archivo para la sección '${section}':`, error);
            }
        } else {
            console.warn(`No se encontraron archivos para la sección: ${section}`);
        }
    }

    console.log("Chatbot response generated:", chatbotResponse);

    res.json({ paper: generatedPaper, chatbotResponse });
});

// Start the server
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
