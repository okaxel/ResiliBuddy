/* webAxe */

class axe {

}

/* local */

const LOCAL_SETTINGS = {lang : 'en',
                        langSpec : 'US',
                        voiceName : null};
const APP_STATE = {chromeCounter : 0,
                   recognizedText : '',
                   recognizer : null,
                   recognizing : false,
                   voice : null};


function listenStart() {

    if (APP_STATE.recognizing === true) return false;
    if (APP_STATE.recognizer === null) return false;
    appTest.innerText = 'listening...';

}

function modalToggle(modalId) {

    const modal_ = document.getElementById(modalId);
    if (modal_ === null) return false;
    if (modal_.style.display !== 'flex') modal_.style.display = 'flex'
    else modal_.style.display = 'none';
    return true;

}

function say(content) {

    if (typeof content !== 'string') return false;
    if (content.length == 0) return false;
    if (typeof speechSynthesis === 'undefined') return false;
    if (speechSynthesis.speaking) return false;
    if (APP_STATE.voice === null) return false;
    if (typeof SpeechSynthesisUtterance === 'undefined') return false;
    const utterance_ = new SpeechSynthesisUtterance(content);
    utterance_.lang = APP_STATE.voice.lang;
    utterance_.voice = APP_STATE.voice;
    speechSynthesis.speak(utterance_);
    return true;

}

function setRecognizer() {

    APP_STATE.recognizer = typeof window.SpeechRecognition !== 'undefined' ? new window.SpeechRecognition() : typeof window.webkitSpeechRecognition !== 'undefined' ? new window.webkitSpeechRecognition() : null;
    if (APP_STATE.recognizer === null) return false;
    APP_STATE.recognizer.continuous = true;
    APP_STATE.recognizer.interimResults = true;
    APP_STATE.recognizer.lang = APP_STATE.voice !== null ? APP_STATE.voice.lang : LOCAL_SETTINGS.langSpec !== null ? `${LOCAL_SETTINGS.lang}-${LOCAL_SETTINGS.langSpec}` : LOCAL_SETTINGS.lang;
    APP_STATE.recognizer.onstart = () => {
        APP_STATE.recognizing = true;
    };
    APP_STATE.recognizer.onerror = (event) => {
        switch (event.error) {
            case 'audio-capture':
                showToast('Speech recognition error: No microphone was found.');
                break;
            case 'no-speech':
                showToast('Speech recognition error: No speech was detected.');
                break;
            case 'not-allowed':
                showToast('Speech recognition error: Microphone permission denied or blocked.');
                break;
            default:
                showToast('Unhandled, unknown speech recognition error.');
                break;
        }
    };
    APP_STATE.recognizer.onend = () => {
        APP_STATE.recognizing = false;
        appTest.innerText += `onEnd:\n${APP_STATE.recognizedText}\n\n`;
    };
    APP_STATE.recognizer.onresult = (event) => {
        if (typeof event.results === 'undefined') {
            APP_STATE.recognizer.stop();
            return;
        }
        for (const i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal)
                APP_STATE.recognizedText += event.results[i][0].transcript;
        }
        appTest.innerText += `onResult:\n${APP_STATE.recognizedText}\n\n`;
    };
    return true;

}

function setTabs() {

    let node_ = document.getElementById('appTabSpeechRecognition');
    if (node_ !== null) {
        if (APP_STATE.recognizer !== null) {
            node_.classList.remove('app-tab-speech-recognition-inactive');
            node_.classList.add('app-tab-speech-recognition');
        }
        else {
            node_.classList.remove('app-tab-speech-recognition');
            node_.classList.add('app-tab-speech-recognition-inactive');
        }
    }

}

function setVoice() {

    APP_STATE.voice = voiceByName(LOCAL_SETTINGS['voiceName'] !== undefined ? LOCAL_SETTINGS.voiceName : null);
    if (APP_STATE.voice === null)
        APP_STATE.voice = voiceByLanguage(LOCAL_SETTINGS['lang'] !== undefined ? LOCAL_SETTINGS.lang : 'en',
                                          LOCAL_SETTINGS['langSpec'] !== undefined ? LOCAL_SETTINGS.langSpec : null);

}

function showToast(message) {

    appTest.innerText += `toast:\n${message}\n\n`;

}

function startApp() {

    if (document.readyState !== 'complete') {
        setTimeout(startApp, 100);
        return false;
    }
    setVoice();
    setRecognizer();
    setTabs();
    return true;

}

function startAppChrome() {

    if (typeof speechSynthesis === 'undefined') startApp();
    if (speechSynthesis.getVoices().length == 0 && APP_STATE.chromeCounter < 10) {
        setTimeout(startAppChrome, 100);
        APP_STATE.chromeCounter++;
        return;
    }
    startApp();

}

function startSpeechRecognition() {

    if (APP_STATE.recognizer === null) return false;
    if (APP_STATE.recognizing === true) return false;
    modalToggle('appModalSpeechRecognition');
    APP_STATE.recognizer.start();

}

function stopSpeechRecognition() {

    modalToggle('appModalSpeechRecognition');
    APP_STATE.recognizer.stop();

}

function voiceByLanguage(language, languageSpec) {

    let targets_ = [language];
    if (typeof languageSpec === 'string') {
        targets_.push(`${language}-${languageSpec}`);
        targets_.push(`${language}_${languageSpec}`)
    }
    if (typeof speechSynthesis === 'undefined') return null;
    for (const voice of speechSynthesis.getVoices())
        if (targets_.includes(voice.lang)) return voice;
    return null;

}

function voiceByName(name) {

    if (typeof speechSynthesis === 'undefined') return null;
    if (name === null) return null;
    for (const voice of speechSynthesis.getVoices())
        if (voice.name == name) return voice;
    return null;

}

if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) startAppChrome();
else startApp();