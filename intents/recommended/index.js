const Speech = require('ssml-builder');
const State = require ('../../common/state.js');
const schema = require('./_schema.json')
exports.schema = schema

const courses = require('../../common/ctc/courses.js');

exports.Handler =[ {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && ["RecommendedIntent", "PrerequisiteIntent"].includes(request.intent.name)
            && ["STARTED", "IN_PROGRESS"].includes(request.dialogState);
    },
    async handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
},
{
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && ["RecommendedIntent", "PrerequisiteIntent"].includes(request.intent.name)
            && ["COMPLETED"].includes(request.dialogState);
    },
    async handle(handlerInput) {
        let speech = new Speech();
        let s = new State(handlerInput.requestEnvelope.request.intent.slots);
        const which = handlerInput.requestEnvelope.request.intent.name === "RecommendedIntent";

        const footnote = (which ? await courses.getRecommended(s.subject, s.number) :
                                  await courses.getPrerequisite(s.subject, s.number));

        if(!Array.isArray(footnote)) {
            speech.say("I couldn't find that")
        } else if (footnote.length > 0) {
            speech.say((which ? "recommendations" : "prerequisites"))
                .say("for")
                .say(s.subject)
                .say(s.number)
                .say("include")
                .say(footnote[1].replace(/&/g, ''))
        } else {
            speech.say("There are no")
                .say((which ? "recommendations" : "prerequisites"))
                .say("for you to take before")
                .say(s.subject)
                .say(s.number)
        }

        return handlerInput.responseBuilder.speak(speech.ssml(true))
            .getResponse();
    },
}]
