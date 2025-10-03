const ChatRoomModel = require("../models/chatModel");


const initGroupChat = async () => {
  try {
    const existing = await ChatRoomModel.findOne({type: 'group', name: 'general'});

    if (!existing) {
      const defaultSettings = {
        type: "group",
        participants: [],
        name: "general"
      };

      await ChatRoomModel.create(defaultSettings);
    }
  } catch (error) {
    console.error("❌ Error initializing chat group", error);
  }
};


async function setupApp() {
  initGroupChat();
  console.log("App init successful");
}

module.exports = setupApp;
