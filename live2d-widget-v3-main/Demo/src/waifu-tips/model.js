import showMessage from "./message.js";

class Model {
    constructor(config) {
        let { cdnPath, switchType } = config;
        this.cdnPath = cdnPath;
        this.isOrderSwitch = switchType === 'order'
    }

    /**
     * 加载模型列表
     * @returns {Promise<void>}
     */
    async loadModelList() {
        const response = await fetch(`${this.cdnPath}model_list.json`);
        this.modelList = await response.json();
        console.log()
    }

    /**
     * 加载模型
     * @param modelId 模型id
     * @param modelTexturesId 模型皮肤id
     * @param message 消息
     * @returns {Promise<void>}
     */
    async loadModel(modelId, modelTexturesId, message) {
        localStorage.setItem("modelId", modelId);
        localStorage.setItem("modelTexturesId", modelTexturesId);
        if (!this.modelList) await this.loadModelList();
        showMessage(message, 4000, 10);
        const target = this.modelList.models[modelId][modelTexturesId];
        if (target === undefined) {
            if (parseInt(modelId) === 0 && parseInt(modelTexturesId) === 0) {
                return;
            }
            await this.loadModel(0, 0, this.modelList.messages[0][0]);
            return;
        }
        window.live2d.loadModel(`${this.cdnPath}`+ 'model/' + target + '/')
    }

    /**
     * 切换皮肤（同一组模型）
     * @returns {Promise<void>}
     */
    async switchTextures() {
        const modelId = localStorage.getItem("modelId");
        let modelTexturesId = parseInt(localStorage.getItem("modelTexturesId"));
        if (!this.modelList) await this.loadModelList();
        const textureLength = this.modelList.models[modelId].length;
        if (this.isOrderSwitch) {
            modelTexturesId = (modelTexturesId + 1) % textureLength;
        } else {
            let randomTexturesId;
            do {
                randomTexturesId = Math.floor(Math.random() * textureLength);
            } while (randomTexturesId === modelTexturesId)
            modelTexturesId = randomTexturesId
        }
        // 加载模型
        this.loadModel(modelId, modelTexturesId, this.modelList.messages[modelId][modelTexturesId])
    }

    /**
     * 切换模型
     * @returns {Promise<void>}
     */
    async switchModel() {
        let modelId = localStorage.getItem("modelId");
        if (!this.modelList) await this.loadModelList();
        const index = (++modelId >= this.modelList.models.length) ? 0 : modelId;
        this.loadModel(index, 0, this.modelList.messages[index][0]);
    }
}

export default Model;
