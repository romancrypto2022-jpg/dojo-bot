// ═══════════════════════════════════════════════
// DOJO Leadership OS — Smart Notifications
// GitHub Actions: запускается по расписанию
// ═══════════════════════════════════════════════

const BOT_TOKEN        = process.env.BOT_TOKEN;
const FIREBASE_PROJECT = 'dojo-leadership';
const DOJO_URL         = 'https://romansmolkov.com/dojo/app';
const TYPE             = process.env.NOTIFY_TYPE || 'morning';

// ── КОНТЕНТ ──────────────────────────────────────
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
  "Возможности не исчезают. Их забирают те кто действует.",
  "Действие создаёт ясность. Ожидание — сомнения.",
  "Ты не найдёшь идеальный момент. Ты его создашь.",
  "Промедление — это тоже решение. Просто плохое.",
  "Сделай сегодня то, за что завтра скажешь себе спасибо.",
  "Разница между теми кто хочет и теми кто имеет — в ежедневных действиях.",
  "Не жди вдохновения. Начни — и оно придёт.",
  "Лидер решает проблемы. Остальные их обсуждают.",
  "Люди приходят ради продукта. Остаются ради лидера.",
  "Лучшее что ты можешь сделать для команды — расти сам.",
  "Авторитет не дают. Его зарабатывают каждый день.",
  "Каждый кому ты не написал — это чья-то команда.",
  "Людей не нужно убеждать хотеть лучшей жизни. Им нужно показать путь.",
  "Один человек из десяти скажет да. Напиши десяти.",
  "Страх отказа стоит тебе дороже, чем сам отказ.",
  "Ты не навязываешься. Ты предлагаешь то, что изменило твою жизнь.",
  "Дискомфорт — это GPS роста. Если неудобно — ты на правильном пути.",
  "Твой доход вырастет ровно настолько, насколько вырастешь ты.",
  "Каждая ошибка — урок оплаченный авансом.",
  "Самые быстрорастущие люди — те кто учится быстрее всех.",
  "Успех — это не везение. Это предсказуемый результат правильных действий.",
  "Жалобы ничего не строят. Действия — строят.",
  "Ограничения живут в голове. Проверь, настоящие ли они.",
  "Не спрашивай почему это происходит с тобой. Спрашивай — для чего.",
  "Уверенность не приходит до действия. Она приходит через действие.",
  "Настоящая свобода — это когда место проживания становится выбором.",
  "Большинство людей живут от пятницы до пятницы. Ты строишь другое.",
  "Ты не работаешь на бизнес. Ты строишь актив который работает на тебя.",
  "Хочешь путешествовать — построй систему которая тебя кормит пока ты в пути.",
  "Система важнее мотивации. Мотивация приходит и уходит. Система остаётся.",
  "То что измеряется — то улучшается."
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
  "Какой навык ты развиваешь прямо сейчас?",
  "Для кого ты строишь этот бизнес — и помнишь ли ты об этом каждый день?",
  "Что будет через 5 лет если ты продолжишь делать то что делаешь сейчас?",
  "Что будет через 5 лет если ты ничего не изменишь?",
  "Ты помнишь почему начал? Это всё ещё твоя причина?",
  "Твои действия сегодня отражают твои приоритеты?"
];

function getDayIndex() {
  return Math.floor(Date.now() / 86400000) % THOUGHTS.length;
}

function getDaysAbsent(lastDate) {
  if (!lastDate) return 999;
  const diff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
  return diff;
}

// ── FIRESTORE REST API ────────────────────────────
async function getAllUsers() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.documents) { console.log('No users found'); return []; }
  return data.documents.map(doc => {
    const f = doc.fields || {};
    // Распаковываем цели (map тип в Firestore)
    const goalField = f.goal?.mapValue?.fields || {};
    const goal = {
      income:   goalField.income?.stringValue   || null,
      reason:   goalField.reason?.stringValue   || null,
      maingoal: goalField.maingoal?.stringValue || null,
      dream:    goalField.dream?.stringValue    || null,
      forwhom:  goalField.forwhom?.stringValue  || null,
    };
    return {
      uid:        f.uid?.stringValue,
      name:       f.name?.stringValue || 'Партнёр',
      chatId:     f.chatId?.stringValue,
      streak:     parseInt(f.currentStreak?.integerValue || 0),
      lastDate:   f.lastActiveDate?.stringValue || '',
      invitedBy:  f.invitedBy?.stringValue || null,
      goal
    };
  }).filter(u => u.chatId);
}

// ── ОТПРАВИТЬ СООБЩЕНИЕ ───────────────────────────
async function sendMsg(chatId, text, btnText = '✓ Открыть DOJO') {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:      chatId,
      text,
      parse_mode:   'Markdown',
      reply_markup: { inline_keyboard: [[{ text: btnText, url: DOJO_URL }]] }
    })
  });
  await new Promise(r => setTimeout(r, 150));
  return res.ok;
}

// ── УВЕДОМИТЬ ЛИДЕРА О ПРОПАВШЕМ ПАРТНЁРЕ ────────
async function notifyLeader(users, absentUser, daysAbsent) {
  if (!absentUser.invitedBy) return;
  const leader = users.find(u => u.uid === absentUser.invitedBy);
  if (!leader?.chatId) return;
  const name = absentUser.name.split(' ')[0];
  const text =
    `⚠️ *Партнёр пропал*\n\n` +
    `👤 *${absentUser.name}* не заходил в DOJO уже *${daysAbsent} дней*.\n\n` +
    `Возможно стоит написать лично и узнать как дела.`;
  await sendMsg(leader.chatId, text, '📊 Открыть кабинет лидера');
  console.log(`Leader notified about ${absentUser.name} (${daysAbsent} days absent)`);
}

// ── ОСНОВНАЯ ЛОГИКА ───────────────────────────────
async function main() {
  const users  = await getAllUsers();
  const dayIdx = getDayIndex();
  const today  = new Date().toISOString().split('T')[0];
  let sent = 0, skipped = 0;

  console.log(`Type: ${TYPE} | Users with chatId: ${users.length} | Date: ${today}`);

  for (const user of users) {
    const name    = user.name.split(' ')[0];
    const absent  = getDaysAbsent(user.lastDate);
    let text      = null;
    let btnText   = '✓ Открыть DOJO';

    // ── СРЕДА: НАПОМИНАНИЕ О ЦЕЛЯХ ────────────────
    if (TYPE === 'goals') {
      const g = user.goal || {};
      if (!g.maingoal && !g.dream) { skipped++; continue; }
      const name = user.name.split(' ')[0];
      let goalLines = '';
      if (g.income)   goalLines += `💰 *Цель по доходу:* ${g.income}\n`;
      if (g.maingoal) goalLines += `🎯 *Главная цель:* ${g.maingoal}\n`;
      if (g.dream)    goalLines += `✨ *Мечта:* ${g.dream}\n`;
      if (g.forwhom)  goalLines += `❤️ *Для кого:* ${g.forwhom}\n`;
      if (g.reason)   goalLines += `💡 *Зачем:* ${g.reason}\n`;
      text =
        `🔄 *${name}, помни зачем ты здесь*\n\n` +
        `Ты написал это сам — в первый день:\n\n` +
        goalLines +
        `\nКаждое действие сегодня приближает тебя к этому 👇`;
      btnText = '✓ Отметить действия';
    }

    // ── ВОСКРЕСНЫЙ АУДИТ ──────────────────────────
    else if (TYPE === 'audit') {
      // Напоминание об аудите — всем кто ещё не прошёл
      const name = user.name.split(' ')[0];
      text =
        `📋 *${name}, время подвести итоги недели!*\n\n` +
        `6 вопросов · 3 минуты · раз в неделю\n\n` +
        `• Сколько пригласил?\n` +
        `• Что было победой?\n` +
        `• Что изменишь на следующей неделе?\n\n` +
        `Аудит помогает видеть рост и не повторять ошибки 👇`;
      btnText = '📋 Пройти аудит';
    }

    // ── УТРЕННЯЯ РАССЫЛКА ──────────────────────────
    else if (TYPE === 'morning') {
      const streakLine = user.streak > 1 ? `\n🔥 Серия: *${user.streak} дней* — держи ритм!\n` : '';
      text =
        `☀️ *Доброе утро, ${name}!*\n\n` +
        `💡 *Мысль дня:*\n_${THOUGHTS[dayIdx]}_\n\n` +
        `❓ *Вопрос:*\n${QUESTIONS[dayIdx % QUESTIONS.length]}${streakLine}\n` +
        `Отметь действия сегодня 👇`;
      btnText = '✓ Открыть чеклист';
    }

    // ── УМНЫЕ ВЕЧЕРНИЕ УВЕДОМЛЕНИЯ ─────────────────
    else if (TYPE === 'evening') {

      if (absent === 0) {
        // Активен сегодня — не беспокоим
        skipped++;
        continue;

      } else if (absent === 1) {
        // Не заходил сегодня — мягкое напоминание
        text =
          `🎯 *${name}, ещё не поздно*\n\n` +
          `Отметь хотя бы одно действие — и день засчитан.\n` +
          `2 минуты. Серия продолжается 👇`;

      } else if (absent >= 2 && absent <= 3) {
        // 2–3 дня — первый сигнал тревоги
        text =
          `⚡ *${name}, ты пропал на ${absent} дня*\n\n` +
          `Что произошло? Серия прервалась, но Momentum ещё можно восстановить.\n\n` +
          `Вернись — и система продолжит работать на тебя 👇`;

      } else if (absent >= 4 && absent <= 6) {
        // 4–6 дней — серьёзный сигнал
        text =
          `🔴 *${name}, уже ${absent} дней без DOJO*\n\n` +
          `Потерял фокус? Это бывает.\n\n` +
          `Помни: один шаг — и ты снова в системе.\n` +
          `Не откладывай — именно сейчас нужно вернуться 👇`;

      } else if (absent === 7) {
        // Ровно неделя — важное сообщение
        text =
          `❗ *${name}, прошла целая неделя*\n\n` +
          `7 дней — это уже не пауза. Это выбор.\n\n` +
          `Напомни себе почему ты начал — и сделай один шаг прямо сейчас 👇`;
        await notifyLeader(users, user, absent);

      } else if (absent >= 8 && absent <= 13) {
        // 8–13 дней — критично
        text =
          `😶 *${name}, тебя нет уже ${absent} дней*\n\n` +
          `Всё в порядке? Были заняты?\n\n` +
          `Мы здесь. DOJO ждёт — вернись когда будешь готов 👇`;

      } else if (absent === 14) {
        // 2 недели — последнее сообщение серии
        text =
          `🤝 *${name}, 2 недели — долго*\n\n` +
          `Нужна помощь? Напиши своему лидеру — он поможет разобраться.\n\n` +
          `Или просто открой DOJO — иногда достаточно одного шага 👇`;
        await notifyLeader(users, user, absent);

      } else {
        // Больше 14 дней — раз в неделю тихое напоминание
        // Отправляем только в понедельник (день 1)
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek !== 1) { skipped++; continue; }
        text =
          `👋 *${name}*\n\nDOJO всё ещё здесь. Возвращайся когда будешь готов 👇`;
      }
    }

    if (text && await sendMsg(user.chatId, text, btnText)) sent++;
  }

  console.log(`✅ Sent: ${sent} | Skipped: ${skipped} | Total: ${users.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
