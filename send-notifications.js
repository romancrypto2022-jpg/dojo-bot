// DOJO Leadership OS — Daily Notifications
// Запускается GitHub Actions каждый день в 6:00 UTC (9:00 МСК)

const BOT_TOKEN        = process.env.BOT_TOKEN;
const FIREBASE_PROJECT = 'dojo-leadership';
const DOJO_URL         = 'https://romansmolkov.com/dojo/app';
const TYPE             = process.env.NOTIFY_TYPE || 'morning'; // morning | evening

const THOUGHTS = [
  "Каждый день без действий работает против твоей цели.",
  "Среди твоих контактов уже есть будущий лидер твоей команды.",
  "Твоя жизнь через год определяется тем, что ты делаешь сегодня.",
  "Дисциплина — это форма уважения к своим целям.",
  "Маленькое действие каждый день сильнее одного большого усилия раз в месяц.",
  "Рост — это не событие. Это ежедневная практика.",
  "Первый шаг не должен быть идеальным. Он должен быть сделан.",
  "Настоящий лидер не ждёт мотивации. Он создаёт её действием.",
  "Страх — это компас. Он показывает где находится твой рост.",
  "Лидерство — это решение которое принимается каждый день.",
  "Команда отражает лидера. Хочешь другую — стань другим лидером.",
  "Приглашение — это не продажа. Это подарок возможности.",
  "Самая дорогая цена — это сожаление о несделанном.",
  "Стабильность побеждает интенсивность.",
  "Твой следующий лидер уже в твоём телефоне. Просто напиши.",
  "Результаты — это сумма ежедневных решений.",
  "Свобода строится не за один день. Но строится если делать каждый день.",
  "Доход определяется ценностью которую ты создаёшь для других.",
  "Люди которые изменили мир тоже когда-то не знали с чего начать.",
  "Возможности не исчезают. Их забирают те кто действует."
];

const QUESTIONS = [
  "Что ты сделаешь сегодня для своей цели?",
  "Что тебя сейчас тормозит — и что ты можешь с этим сделать?",
  "Если бы успех был гарантирован — сколько людей ты бы пригласил сегодня?",
  "Кто из твоих знакомых сейчас ищет перемен?",
  "Какое одно действие сегодня даст максимальный результат?",
  "Ты строишь команду или ждёшь когда появятся нужные люди?",
  "Что ты сделал вчера что приблизило тебя к цели?",
  "Как ты можешь помочь кому-то в своей команде сегодня?",
  "Что изменится когда ты закроешь следующий ранг?",
  "Какой навык ты развиваешь прямо сейчас?"
];

async function getUsers() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.documents) { console.log('No users found'); return []; }
  return data.documents.map(doc => {
    const f = doc.fields || {};
    return {
      chatId:   f.chatId?.stringValue,
      name:     f.name?.stringValue || 'Партнёр',
      streak:   parseInt(f.currentStreak?.integerValue || 0),
      lastDate: f.lastActiveDate?.stringValue || ''
    };
  }).filter(u => u.chatId);
}

async function sendMsg(chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId, text, parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '✓ Открыть DOJO', url: DOJO_URL }]] }
    })
  });
  await new Promise(r => setTimeout(r, 150));
  return res.ok;
}

async function main() {
  const users   = await getUsers();
  const dayIdx  = Math.floor(Date.now() / 86400000) % THOUGHTS.length;
  const today   = new Date().toISOString().split('T')[0];
  let sent = 0;

  console.log(`Type: ${TYPE} | Users: ${users.length} | Date: ${today}`);

  for (const user of users) {
    const name = user.name.split(' ')[0];

    if (TYPE === 'morning') {
      const streak = user.streak > 1 ? `\n🔥 Серия: *${user.streak} дней* — держи ритм!\n` : '';
      const text =
        `☀️ *Доброе утро, ${name}!*\n\n` +
        `💡 *Мысль дня:*\n_${THOUGHTS[dayIdx]}_\n\n` +
        `❓ *Вопрос:*\n${QUESTIONS[dayIdx % QUESTIONS.length]}${streak}\n` +
        `Отметь действия сегодня 👇`;
      if (await sendMsg(user.chatId, text)) sent++;

    } else if (TYPE === 'evening') {
      if (user.lastDate === today) continue; // уже активен
      const text =
        `🎯 *${name}, ещё не поздно*\n\n` +
        `Отметь хотя бы одно действие — и день засчитан.\n2 минуты. Серия продолжается 👇`;
      if (await sendMsg(user.chatId, text)) sent++;
    }
  }

  console.log(`✅ Sent: ${sent}/${users.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
