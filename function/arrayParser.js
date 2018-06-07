/* 
    arrayParser JS
*/

const util = require('./utility');
const Lexer = require('./lexer');
const lexer = new Lexer();

class ArrayParser {
    constructor(stringData) {
        this.resultObject = {
            type: null,
            child: [],
        };

        // 생성자로 추가하면, getResult() 에서 lexer 에서 catch 구문에 걸림
        // this.lexer = new Lexer();

        this.dividedCharacterDatas = [];

        this.inputString = stringData.trim();
        this.inputStringLength = this.inputString.length;
        this.inputStringFirstCharacter = this.inputString[0];
        this.inputStringLastCharacher = this.inputString[this.inputStringLength-1];

        this.errorMode = false;
        this.errorContent = "";
        this.mergeData = "";
        this.repeatCount = 0;
        this.startSquareBracketsCount = 0;
        this.endSquareBracketsCount = 0;
        this.recursionMode = false;
    }

    getResult() {
        this.dividedCharacterDatas = util.divideString(this.inputString);
        // console.log(lexer);
        // console.log(Lexer);
        this.resultObject.type = lexer.checkType(this.inputString);
        this.resultObject = this.createObject(this.dividedCharacterDatas, this.resultObject);

        if (this.errorMode) return this.errorContent;

        return this.resultObject;
    }

    adjustBracketCount() {
        if (this.startSquareBracketsCount >= 3) this.startSquareBracketsCount--;
        else this.endSquareBracketsCount++;
    }

    checkTwoMoreSquareBracket() {
        return this.startSquareBracketsCount >= 2 && this.endSquareBracketsCount === 0;
    }

    equalCurlyBracket() {
        if (this.startCurlyBracketsCount === this.endCurlyBracketsCount) {
            this.curlyBracketsMode = false;
            this.mergeData = this.recursionCase(this.mergeData);
        }
    }

    closedInnerSquareBracket(element) {
        if (this.endSquareBracketsCount >= 1 && 
            this.endSquareBracketsCount == this.startSquareBracketsCount-1) {
                this.mergeData += element;
                this.startSquareBracketsCount--;
                this.endSquareBracketsCount--;
                return true;
            }
    }

    determineType() {
        const dataType = lexer.decisionType(this.mergeData);
        this.setResultObjectChildData(dataType);
        this.mergeData = "";
    }

    setResultObjectChildData(data) {
        Array.prototype.push.call(this.resultObject.child, data);
    }

    recursionCase(mergeData) {

        if (util.checkFirstLetterBracket(mergeData)) {
            this.changeObjectProperties();
        }

        const secondArrayParser = new ArrayParser(mergeData);
        mergeData = secondArrayParser.getResult();
        return mergeData;
    }

    checkBracket(element) {

        if (util.checkStartCurlyBracket(element)) {
            this.startCurlyBracketsCount++;
            if (!this.curlyBracketsMode) {
                this.curlyBracketsMode = util.checkNoDataExists(this.mergeData);
            }
        }
        if (util.checkEndCurlyBracket(element)) {
            this.endCurlyBracketsCount++;
        }

        if (this.curlyBracketsMode) return;

        if (util.checkStartSquareBracket(element)) {
            this.startSquareBracketsCount++;
        }
        if (util.checkEndSquareBracket(element)) {
            this.adjustBracketCount();
        }
    }

    createObject(dividedCharacterDatas, resultObject) {

        const arrayEndPoint = dividedCharacterDatas.length;
        this.resultObject = resultObject;

        Array.prototype.forEach.call(dividedCharacterDatas, element => {

            this.repeatCount++;
            this.checkBracket(element);

            if (util.checkSpace(element)) return;

            switch(true) {
                case this.curlyBracketsMode:
                    this.mergeData += element;
                    this.equalCurlyBracket();
                    break;
                case this.checkTwoMoreSquareBracket():
                    this.mergeData += element;
                    break;
                case util.checkComma(element):
                    this.determineType();
                    break;
                case util.checkEndCondition(this.repeatCount, arrayEndPoint):
                    this.determineType();
                    break;
                case this.closedInnerSquareBracket(element):
                    this.mergeData = this.recursionCase(this.mergeData);
                    break;
                case util.checkOneMoreSquareBracket(this.startSquareBracketsCount):
                    this.mergeData += element;
                    break;
            }
        });

        return this.resultObject;
    }    
}

module.exports = ArrayParser;