import React, { Component } from "react";
import styles from './Speech.styl';

class Speech extends Component {
    constructor() {
        super();
        this.state = ({
            text: 'init',
        })
    }

    componentDidMount() {
        this.initSpeech();
    }

    initSpeech = () => {
        window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speech = new window.SpeechRecognition();

        const { speech } = this;
        speech.lang = "en";
        speech.interimResults = false;

        const handleResults = event => {
            console.log('handleResults')

            const text = event.results[0][0].transcript;
            this.setState({
                text: text + '\n' + this.state.text,
            })
        };

        speech.addEventListener("result", handleResults);
        speech.addEventListener("end", this.startRecording);
    }

    startRecording = () => {
        console.log('startRecording')
        this.speech.start();
    }

    render() {
        return (
            <div className={styles.speech}>
                <button onClick={this.startRecording} className={styles.button}>start 🎙</button>
                <p>{this.state.text}</p>
            </div>
        );
    }
}

export default Speech;
