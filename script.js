const form = document.getElementById('form');
const apiKeyInput = document.getElementById('apiKeyInput');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');

const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

// AIzaSyAlJK2JMu7V3TMMgvbjYWXZ8GTY3tGYcs4
const perguntarAi = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const modelPrompt = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responsda itens que vc não tenha certeza de que existe no patch atual.

    ## Resposta
    - Economize na resposta, seja direto e responda no máximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    ---
    Aqui está a pergunta do usuário: ${question}    
    `
    let pergunta = ''

    const perguntaLol = `
    ## Prompt
    ${modelPrompt}

    ## Tarefa  
    Você deve responder às perguntas do usuário com base no seu conhecimento do jogo, incluindo:  
    - Builds atualizadas (itens, runas, summoner spells)  
    - Matchups e counters  
    - Rotas e macro jogo (objetivos, rotacionamento)  
    - Dicas de mecânicas (combos, farming, trading)  

    ## Exemplo de Resposta  

    **Pergunta do usuário:** "Melhor build para Yasuo mid no patch atual?"  

    **Resposta:**  

    **Build atual para Yasuo (14.X):**  
    - **Itens principais:**  
    - **Berserker's Greaves** (velocidade de ataque)  
    - **Statikk Shiv** (waveclear e burst)  
    - **Infinity Edge** (dano crítico aumentado)  
    - **Immortal Shieldbow** (sobrevivência)  
    - **Bloodthirster** (sustain em combate)  

    **Runas recomendadas:**  
    - **Precisão:**  
    - **Conquistador** (dano prolongado)  
    - **Presença de Espírito** (mana sustain)  
    - **Lenda: Espontaneidade** (velocidade de ataque)  
    - **Golpe de Misericórdia** (dano em alvos baixos)  
    - **Dominação (secundária):**  
    - **Gosto de Sangue** (sustain em trocas)  
    - **Caçador de Tesouros** (ou **Caçador Voraz**)  

    **Dicas de jogabilidade:**  
    - Abuse do **E (Steel Tempest)** em minions para reposicionamento rápido.  
    - Use **Wind Wall (W)** para bloquear habilidades críticas (ex.: **Syndra Q, Lux R**).  
    - Priorize **rotacionar para side lanes** após o level 6 para pressionar o mapa.  
    `

    const perguntaValorant = `
    ## Prompt
    ${modelPrompt}

    ## Tarefa  
    Você deve responder às perguntas do usuário com base no seu conhecimento do jogo, incluindo:  
    - Estratégias de time  
    - Composição de agentes  
    - Posicionamento em mapas  
    - Controle de utilidades (smokes, flashes, molotovs)  
    - Dicas de mecânicas (tiro, movimento, economia)  

    ## Exemplo de Resposta  

    **Pergunta do usuário:** "Melhor composição de agentes para o mapa Ascent?"  

    **Resposta:**  

    **Agentes recomendados para Ascent:**  
    - **Controlador:** **Omen** (smokes precisas e teleportes estratégicos)  
    - **Iniciador:** **Sova** (reconhecimento com drone e flechas de choque)  
    - **Duelista:** **Jett** (mobilidade para operar e controlar ângulos altos)  
    - **Sentinela:** **Killjoy** (lockdown no Bombsite B com nanoswarm e alarmbot)  

    **Estratégia principal:**  
    - Use smokes do **Omen** para bloquear **Mid** e **Tree**.  
    - **Sova** deve priorizar info com **drone** e **flechas de choque** para limpar cantos.  
    - **Jett** deve jogar agressiva em **A Main** com updraft e dash.  
    - **Killjoy** deve segurar **B** com setups defensivos.  
    `

    if(game == 'Valorant') {
        pergunta = perguntaValorant;
    }
    else {
        pergunta = perguntaLol;
    }

    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    const response = await fetch (geminiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json();
    return data.candidates [0].content.parts[0].text;
}

const enviarFormulario = async (event) => { 
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try {
        const text = await perguntarAI(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.log('Erro: ', error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove('loading');
    }
}

form.addEventListener('submit', enviarFormulario);