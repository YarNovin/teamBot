import { Context, Snake } from "tgsnake";
// import fs from "fs";
import { Combine, MessageContext } from "tgsnake/lib/Context";
import moment from "moment-jalaali";

const bot = new Snake({
  apiId: 16946914,
  apiHash: "840e20c7fc0998b976d242a108d68784",
  botToken: "5532535099:AAHK-lYwtgPNdBl59OwTbOPVg2T0chCURTQ",
});
//@ts-ignore
BigInt.prototype.toJSON = function() { return this.toString() }
type teamType = {
  id: bigint;
  name: string;
  userId: string;
  free: number;
};

let data: any = {};
let admins = [5487311601n];
let team: teamType[] = [];

const notif = () => {
  let text =
    "📅 " +
    moment().format("jYYYY/jMM/jDD") +
    "\n\n" +
    "❌ افراد زیر گزارش کار را ارسال نکرده اند" +
    "\n\n";
  let text2 = "✅ افراد زیر گزارش کار را ارسال کرده اند" + "\n\n";
  let text3 = "🆓 افراد زیر در مرخصی هستند" + "\n\n";
  for (let v of team) {
    if (v.free > 0) {
      text3 += "👤 " + v.name + "\n" + v.free + "روز باقی مانده" + "\n\n";
      continue;
    }
    let has: any = false;
    for (let v2 of data[moment().format("jYYYY/jMM/jDD")] || []) {
      if (v.userId == v2.user) {
        has = v2;
        break;
      }
    }
    if (!has) {
      text += "👤 @" + v.userId + "\n\n";
    } else {
      text2 += "👤 " + v.name + "\n" + has.text + "\n\n";
    }
  }
  bot.telegram.sendMessage(-1001778747367n, text + text2 + text3);
};

let teamAction = [
  {
    text: "set",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      if (
        data[moment().format("jYYYY/jMM/jDD")]?.find(
          (x: any) => x.user == ctx.from.username
        )
      ) {
        return ctx.reply(
          "شما قبلا گزارش روزانه خود را ثبت کرده اید، برای ثبت مجدد ابتدا گزارش را حذف کنید"
        );
      }
      if (!data[moment().format("jYYYY/jMM/jDD")]) {
        data[moment().format("jYYYY/jMM/jDD")] = [];
      }
      data[moment().format("jYYYY/jMM/jDD")].push({
        user: ctx.from.username,
        text: ctx.text?.replace("set", ""),
      });
      ctx.reply("باتشکر از شما، گزارش روزانه شما ثبت گردید");
    },
  },
  {
    text: "tag",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      let txt = "کاربر " + ctx.from.firstName + " شما را منشن کرده است 🔊\n\n";
      let users = team.filter((x) => x.id != ctx.from.id);
      for (let v of users) {
        txt += "👤 @" + v.userId + "\n";
      }
      ctx.telegram.sendMessage(ctx.chat.id, txt);
    },
  },
  {
    text: "delete",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      if (!data[moment().format("jYYYY/jMM/jDD")]) {
        data[moment().format("jYYYY/jMM/jDD")] = [];
      }
      data[moment().format("jYYYY/jMM/jDD")] = data[
        moment().format("jYYYY/jMM/jDD")
      ].filter((x: any) => x.user != ctx.from.username);
      ctx.reply("گزارش امروز شما حذف گردید");
    },
  },
  {
    text: "list",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      let dataForSend = "📅 " + moment().format("jYYYY/jMM/jDD") + "\n\n";
      for (let v of data[moment().format("jYYYY/jMM/jDD")]) {
        v.name = team.find((x) => x.userId == v.user)?.name;
        dataForSend += "👤 " + v.name + "\n" + v.text + "\n\n";
      }
      ctx.reply(dataForSend);
    },
  },
];

let adminAction = [
  {
    text: "add",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      team.push({
        id: ctx.replyToMessage?.from.id!,
        name: ctx.replyToMessage?.from.firstName!,
        userId: ctx.replyToMessage?.from.username!,
        free: 0,
      });
      ctx.reply("به اعضای تیم اضافه گردید");
    },
  },
  {
    text: "remove",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      team = team.filter((v) => v.id != ctx.replyToMessage?.from.id);
      ctx.reply("از اعضای تیم حذف گردید");
    },
  },
  {
    text: "free",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      team[team.findIndex((v) => v.id == ctx.replyToMessage?.from.id)].free =
        Number(ctx.text?.replace("free", "").trim());
      ctx.reply("مرخصی ثبت شد");
    },
  },
  {
    text: "addA",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      admins.push(ctx.replyToMessage?.from.id!);
      ctx.reply("به مدیران تیم اضافه گردید");
    },
  },
  {
    text: "removeA",
    callBack: (ctx: Combine<MessageContext, {}>) => {
      admins.push(ctx.replyToMessage?.from.id!);
      ctx.reply("از مدیران تیم حذف گردید");
    },
  },
];

bot.on("message", (ctx) => {
  if (
    adminAction.find((x) => ctx.text?.startsWith(x.text)) &&
    admins.includes(ctx.from.id) &&
    ctx.replyToMessage
  ) {
    for (let v of adminAction) {
      if (ctx.text?.startsWith(v.text)) {
        v.callBack(ctx);
      }
    }
  } else if (
    teamAction.find((x) => ctx.text?.startsWith(x.text)) &&
    team.find((x) => x.id == ctx.from.id)
  ) {
    for (let v of teamAction) {
      if (ctx.text?.startsWith(v.text)) {
        v.callBack(ctx);
      }
    }
  }
});

setInterval(() => {
  const day = new Date().getDay();
  if (day == 4 || day == 5) {
    return;
  }
  notif();
}, 10800000);

setInterval(() => {
  for (let v of team) {
    if(v.free > 0){
      v.free--;
    }
  }
  // fs.writeFileSync("./data/Admin.json", JSON.stringify(admins));
  // fs.writeFileSync("./data/Team.json", JSON.stringify(team));
  // fs.writeFileSync("./data/Data.json", JSON.stringify(data));
  bot.telegram.sendDocument(admins[0],Buffer.from(JSON.stringify(admins)),{filename : "admin.json"})
  bot.telegram.sendDocument(admins[0],Buffer.from(JSON.stringify(team)),{filename : "team.json"})
  bot.telegram.sendDocument(admins[0],Buffer.from(JSON.stringify(data)),{filename : "data.json"})
}, 1000 * 60 * 60 * 24);

bot.run();
