import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
	const [input, setInput] = useState("");
	const [recentPrompt, setRecentprompt] = useState("");
	const [prevPrompts, setPrevPrompts] = useState([]);
	const [prevResponses, setPrevResponses] = useState([]);
	const [showResult, setShowResult] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");
	const [conversationHistory, setConversationHistory] = useState([]);

	const delaypara = (index, nextWord) => {
		setTimeout(function () {
			setResultData((prev) => prev + nextWord);
		}, 75 * index);
	};

	const newChat = () => {
		setLoading(false);
		setShowResult(false);
		setConversationHistory([]);
		setPrevPrompts([]);
		setPrevResponses([]);
	};

	const onSent = async (prompt) => {
		setResultData("");
		setLoading(true);
		setShowResult(true);

		let currentPrompt;
		if (prompt !== undefined) {
			currentPrompt = prompt;
			setRecentprompt(prompt);
		} else {
			currentPrompt = input;
			setPrevPrompts((prev) => [...prev, input]);
			setRecentprompt(input);
		}

		const fullPrompt = buildConversationPrompt(currentPrompt);

		let response = await run(fullPrompt);

		const newHistoryItem = {
			prompt: currentPrompt,
			response: response,
		};

		setConversationHistory((prev) => [...prev, newHistoryItem]);
		setPrevResponses((prev) => [...prev, response]);

		let responseArray = response.split("**");
		let newResponse = "";
		for (let i = 0; i < responseArray.length; i++) {
			if (i === 0 || i % 2 !== 1) {
				newResponse += responseArray[i];
			} else {
				newResponse += "<b>" + responseArray[i] + "</b>";
			}
		}
		let newResponse2 = newResponse.split("*").join("</br>");

		let newResponseArray = newResponse2.split(" ");
		for (let i = 0; i < newResponseArray.length; i++) {
			const nextWord = newResponseArray[i];
			delaypara(i, nextWord + " ");
		}
		setLoading(false);
		setInput("");
	};

	const buildConversationPrompt = (currentPrompt) => {
		if (conversationHistory.length === 0) {
			return currentPrompt;
		}

		const recentHistory = conversationHistory.slice(-5);

		let contextPrompt = "Previous conversation:\n\n";

		recentHistory.forEach((item) => {
			contextPrompt += `User: ${item.prompt}\n`;
			contextPrompt += `Assistant: ${item.response}\n\n`;
		});

		contextPrompt += `User: ${currentPrompt}\n`;
		contextPrompt += "Assistant:";

		return contextPrompt;
	};

	const contextValue = {
		prevPrompts,
		setPrevPrompts,
		prevResponses,
		conversationHistory,
		onSent,
		setRecentprompt,
		recentPrompt,
		showResult,
		loading,
		resultData,
		input,
		setInput,
		newChat,
	};
	return (
		<Context.Provider value={contextValue}>{props.children}</Context.Provider>
	);
};

export default ContextProvider;
