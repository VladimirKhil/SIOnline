const appLocalization = {
	en: {
		about: [
			'SIGame is an intellectual quiz in which everyone can test their knowledge and reaction speed and fight against opponents.',
			`Game rules are very simple: all questions in the game are divided into themes,
			 and each question in the theme has its own price.
			 Each player has a personal score, which at the beginning of the game is 0.
			 A question is presented, after which a frame appears on the screen indicating that you can press the button and answer.
			 If the player knows the answer, he/she can press the red button. The player who presses the button earlier than others
			 (and will not have a false start), gives an answer. If the answer is correct, the question price is added to the player's score;
			 otherwise - the price is substracted from the score.
			 In the latter case, other players can try their luck and press the button to answer.`,
			`There are also special questions in the game.
			In the "Stake Question" the participants bid for a question, and the player with the highest bet answers.
			In this case, the "All-in" bet (the bet which is equal to the whole player score) can only be outbid by another "All-in".`,
			`"Secret Question" must be given to another player.
			The player who received it must (if it is included in the question) choose the price of the question and answer it.
			The theme of the question may differ from the main theme in which the question was opened.`,
			'"Question for yourself" is answered by the player who opened it.',
			`The game can also have a final round in which each of the players makes a stake.
			A question is asked, time is given for thinking, and each of the players submits their answer to the host.
			After that, the correct answer is announced, and each of the players receives or loses money according to their bet.`,
			'The game winner is the player with the highest score after the last question.',
			'The game button can also be activated using the specified key or the right mouse button.'
		],
		aboutAuthor: 'Author',
		aboutSupport: 'Technical support',
		acceptLicense: 'Accept license',
		appName: 'SIGame',
		appTagline: 'Online multiplayer trivia game. Think fast, answer first!',
		authorInfo: 'Vladimir Khil',
		composer: 'Composer',
		copyText: 'Copy text to clipboard',
		donate: 'Donate',
		donateComment: `Donations are optional and are used exclusively to cover hosting and domain expenses.
The project is non-commercial and exists for educational purposes.
All game functionality is available for free—donations do not affect gameplay or grant access to additional features. Thank you for your support!`,
		enter: 'Sign in',
		errorHappened: 'Error',
		gameAuthor: 'Game author',
		gameLoading: 'Game loading…',
		howToPlay: 'How to play',
		connectingToServer: 'Connecting to server…',
		joinLobby: 'Online game',
		license: 'License',
		licenseInfo: 'License: any use of the game is allowed with the condition of attribution.',
		noWarranty: `The game is distributed free of charge.
		The author does not guarantee the correct operation of the game in arbitrary conditions
		and is not responsible for any consequences from the game usage.`,
		questionEditor: 'Question editor',
		reloadPage: 'Reload page',
		singlePlay: 'Single game',
		sourcesInfo: 'Game source code page.',
		supportInfo: 'Support page.',
		usedComponents: 'Game components and licenses:',
		aboutTitle: 'About',
		appUser: 'SIGame',
		contactUri: 'Authors contact',
		cookiesConfirm: 'Accept cookies',
		cookiesWarning: 'This application uses cookies. If you stay on this page, you ageee with that',
		copyrightIssue: 'Copyright issue',
		creatingGame: 'Creating game…',
		donateServersHosting: 'DONATE: development, hosting',
		fullScreen: 'Full screen mode',
		html: 'HTML',
		images: 'Images',
		info: 'Info',
		language: 'Language',
		languageEn: 'English',
		languageRu: 'Русский',
		languageSr: 'Srpski',
		languageUz: 'O‘zbek',
		languageEs: 'Español',
		loading: 'Loading',
		logo: 'Logo',
		news: 'News',
		unsupportedBrowser: 'Your browser is not supprted. Please, update or replace it',
		youAreKicked: 'You have been kicked from the game!',
	},
	ru: {
		about: [
			'SIGame — интеллектуальная викторина, в которой каждый может проверить свои знания и скорость реакции и сразиться с оппонентами.',
			`Правила игры очень просты: все вопросы в игре поделены по темам, и у каждого вопроса в теме есть своя стоимость.
	У каждого игрока имеется персональный счёт, который в начале игры равен 0.
	Звучит вопрос, после которого на экране появляется рамка, показывающая, что можно отвечать.
	Если игрок знает ответ, он может нажать на красную кнопку. Тот из игроков, кто нажмёт на кнопку ранее
	(и не допустит фальстарта), и даёт ответ. В случае верного ответа стоимость вопроса прибавляется к счёту игрока;
	в случае неверного — снимается со счёта. В последнем случае другие игроки снова могут попытать счастья и нажать на кнопку для ответа.`,
			`Также в игре могут встретиться специальные вопросы. В "Вопросе со ставкой" участники торгуются за вопрос, и отвечает на него тот игрок,
	кто поставит наибольшую сумму. При этом "Ва-банк" (т.е. ставка всей суммы на кон) может быть перебит только другим "Ва-банком".`,
			`"Вопрос с секретом" открывший его участник должен передать другому участнику. Получивший его игрок должен (если это заложено в вопросе)
	выбрать стоимость вопроса и ответить на него. Тема вопроса может отличаться от основной темы, в которой находился вопрос.`,
			'На "Вопрос для себя" отвечает открывший его игрок.',
			`В игре также может быть финальный раунд, в котором каждый из игроков делает ставку. Звучит вопрос, даётся время на размышление,
	и каждый из игроков письменно сдаёт свой ответ. После этого оглашается правильный ответ, и каждый из игроков получает или теряет деньги.`,
			'Победителем игры становится игрок, набравший после последнего вопроса наибольшую сумму.',
			'Игровую кнопку можно также активировать при помощи назначенной клавиши или правой кнопки мыши.'
		],
		aboutAuthor: 'Автор',
		aboutSupport: 'Техническая поддержка',
		acceptLicense: 'Принять лицензию',
		appName: 'SIGame',
		appTagline: 'Онлайн-викторина для нескольких игроков. Думай быстро, отвечай первым!',
		authorInfo: 'Владимир Хиль',
		composer: 'Композитор',
		copyText: 'Скопировать текст в буфер обмена',
		donate: 'Донат',
		donateComment: `Донаты не обязательны и тратятся только на оплату хостинга и домена.
	 Проект некоммерческий и существует в образовательных целях.
	 Вся функциональность игры доступна бесплатно - донаты не влияют на игровой процесс
	 и не используются для доступа к дополнительным функциям игры. Спасибо за поддержку!`,
		enter: 'Вход',
		errorHappened: 'Ошибка',
		gameAuthor: 'Автор программы',
		gameLoading: 'Идёт загрузка игры…',
		howToPlay: 'Как играть',
		connectingToServer: 'Подключение к серверу…',
		joinLobby: 'Игра онлайн',
		license: 'Лицензия',
		licenseInfo: 'Лицензия: допускается любое использование игры с условием указания авторства.',
		noWarranty: `Игра распространяется бесплатно. Автор не гарантирует корректность работы игры в произвольных условиях
	и не несёт ответственности за любые последствия от использования игры.`,
		questionEditor: 'Редактор вопросов',
		reloadPage: 'Обновить страницу',
		singlePlay: 'Одиночная игра',
		sourcesInfo: 'Страница исходного кода игры.',
		supportInfo: 'Страница технической поддержки.',
		usedComponents: 'Используемые в игре компоненты и их лицензии:',
		aboutTitle: 'Об игре',
		appUser: 'SIGame',
		contactUri: 'Контакты авторов',
		cookiesConfirm: 'Принять',
		cookiesWarning: 'Это приложение использует куки-файлы. Оставаясь на странице, вы соглашаетесь с этим',
		copyrightIssue: 'Нарушение авторских прав',
		creatingGame: 'Создание игры…',
		donateServersHosting: 'ДОНАТ: развитие, хостинг',
		fullScreen: 'Полноэкранный режим',
		html: 'HTML',
		images: 'Изображения',
		info: 'Инфо',
		language: 'Язык',
		languageEn: 'English',
		languageRu: 'Русский',
		languageSr: 'Srpski',
		languageUz: 'O‘zbek',
		languageEs: 'Español',
		loading: 'Загрузка',
		logo: 'Логотип',
		news: 'Новости',
		unsupportedBrowser: 'Ваш браузер не поддерживается. Пожалуйста, обновите или замените его',
		youAreKicked: 'Вас выгнали из игры!',
	},
	sr: {
		about: [
			'SIGame je intelektualna viktorina u kojoj svako može da testira svoje znanje i brzinu reakcije i bori se protiv protivnika.',
			`Pravila igre su veoma jednostavna: sva pitanja u igri su podeljena po temama,
			 i svako pitanje u temi ima svoju cenu.
			 Svaki igrač ima lični rezultat, koji na početku igre iznosi 0.
			 Predstavlja se pitanje, nakon čega se pojavljuje okvir na ekranu koji pokazuje da možete da pritisnete dugme i odgovorite.
			 Ako igrač zna odgovor, može da pritisne crveno dugme. Igrač koji pritisne dugme ranije od drugih
			 (i neće imati lažni početak), daje odgovor. Ako je odgovor tačan, cena pitanja se dodaje na rezultat igrača;
			 u suprotnom - cena se oduzima od rezultata.
			 U potoanjem slučaju, drugi igrači mogu pokušati sreću i pritisnuti dugme da odgovore.`,
			`Postoje i specijalna pitanja u igri.
			U "Pitanju sa ulogom" učesnici se nadmeću za pitanje, a igrač sa najvišim ulogom odgovara.
			U ovom slučaju, "Sve ili ništa" ulog (ulog koji je jednak celom rezultatu igrača) može biti nadmašen samo drugim "Sve ili ništa".`,
			`"Tajno pitanje" mora biti dato drugom igraču.
			Igrač koji ga je primio mora (ako je uključeno u pitanje) da izabere cenu pitanja i odgovori na njega.
			Tema pitanja može se razlikovati od glavne teme u kojoj je pitanje otvoreno.`,
			'"Pitanje za sebe" odgovara igrač koji ga je otvorio.',
			`Igra takođe može imati finalnu rundu u kojoj svaki od igrača postavlja ulog.
			Postavlja se pitanje, daje se vreme za razmišljanje, i svaki od igrača šalje svoj odgovor domaćinu.
			Nakon toga se objavljuje tačan odgovor, i svaki od igrača dobija ili gubi novac prema svom ulogu.`,
			'Pobednik igre je igrač sa najvišim rezultatom nakon poslednjeg pitanja.',
			'Dugme za igru se takođe može aktivirati pomoću imenovanog tastera ili desnog dugmeta miša.'
		],
		aboutAuthor: 'Autor',
		aboutSupport: 'Tehnička podrška',
		acceptLicense: 'Prihvatiti licencu',
		appName: 'SIGame',
		appTagline: 'Onlajn kviz za više igrača. Misli brzo, odgovori prvi!',
		authorInfo: 'Vladimir Hilj',
		composer: 'Kompozitor',
		copyText: 'Kopirati tekst u klipbord',
		donate: 'Donirati',
		donateComment: `Donacije nisu obavezne i koriste se isključivo za pokrivanje hostinga i domena.
		Projekat je nekomercijalan i postoji u obrazovne svrhe.
		Sva funkcionalnost igre dostupna je besplatno - donacije ne utiču na tok igre
		i ne koriste se za pristup dodatnim funkcijama igre. Hvala na podršci!`,
		enter: 'Ulaz',
		errorHappened: 'Greška',
		gameAuthor: 'Autor programa',
		gameLoading: 'Učitavanje igre u toku…',
		howToPlay: 'Kako igrati',
		connectingToServer: 'Povezivanje sa serverom…',
		joinLobby: 'Igra onlajn',
		license: 'Licenca',
		licenseInfo: 'Licenca: dozvoljava se bilo koje korišćenje igre uz uslov navođenja autorstva.',
		noWarranty: `Igra se distribuira besplatno. Autor ne garantuje pravilno funkcionisanje igre u proizvolјnim uslovima
		i nije odgovoran za bilo koje posledice od korišćenja igre.`,
		questionEditor: 'Uređivač pitanja',
		reloadPage: 'Osvežiti stranicu',
		singlePlay: 'Jedinstvena igra',
		sourcesInfo: 'Stranica izvornog koda igre.',
		supportInfo: 'Stranica tehničke podrške.',
		usedComponents: 'Komponente korišćene u igri i njihove licence:',
		aboutTitle: 'O igri',
		appUser: 'SIGame',
		contactUri: 'Kontakt autora',
		cookiesConfirm: 'Prihvatiti',
		cookiesWarning: 'Ova aplikacija koristi kolačiće. Ostajanjem na ovoj stranici, slažete se sa tim',
		copyrightIssue: 'Kršenje autorskih prava',
		creatingGame: 'Kreiranje igre…',
		donateServersHosting: 'DONACIJE: razvoj, hosting',
		fullScreen: 'Režim punog ekrana',
		html: 'HTML',
		images: 'Slike',
		info: 'Info',
		language: 'Jezik',
		languageEn: 'English',
		languageRu: 'Русский',
		languageSr: 'Srpski',
		languageUz: 'O‘zbek',
		languageEs: 'Español',
		loading: 'Učitavanje',
		logo: 'Logotip',
		news: 'Vesti',
		unsupportedBrowser: 'Vaš pregledač nije podržan. Molimo ažurirajte ili zamenite ga',
		youAreKicked: 'Izbačeni ste iz igre!',
	},
	uz: {
		about: [
			'SIGame — bu intellektual viktorina bo‘lib, har kim o‘z bilimini va tezligini sinab ko‘rishi hamda raqiblar bilan bellashishi mumkin.',
			`O‘yin qoidalari juda oddiy: o‘yindagi barcha savollar mavzularga bo‘lingan va har bir savolning o‘z qiymati bor.
        Har bir o‘yinchining shaxsiy hisobi bo‘lib, o‘yin boshida u 0 ga teng bo‘ladi.
        Savol o‘qib eshittirilgach, ekranda javob berish mumkinligini bildiruvchi ramka paydo bo‘ladi.
        Agar o‘yinchi javobni bilsa, qizil tugmani bosishi mumkin. Tugmani boshqalardan avval bosgan (va falstartga yo‘l qo‘ymagan) 
        o‘yinchi javob berish huquqini qo‘lga kiritadi. To‘g‘ri javob berilgan taqdirda, savol qiymati o‘yinchining hisobiga qo‘shiladi;
        javob noto‘g‘ri bo‘lsa — hisobidan chegirib tashlanadi. Bu holatda, boshqa o‘yinchilar javob berish uchun tugmani bosishlari mumkin.`,
			`Shuningdek, o‘yinda maxsus savollar ham uchrab turadi. "Badalli savol"da o‘yinchilar savdolashadi va savolga eng yuqori badalni
        taklif qilgan o‘yinchi javob beradi. Bunda "Va-bank" (bor mablag‘ni tikish) faqatgina boshqa bir "Va-bank" bilan qaytarilishi mumkin.`,
			`"Yashirin savol"ni ochgan ishtirokchi uni boshqa ishtirokchiga o‘tkazishi shart. Savolni qabul qilgan o‘yinchi esa (shartda aytilgan bo‘lsa), 
        savol qiymatini tanlashi va javob berishi kerak. Savol mavzusi u joylashgan asosiy mavzudan farq qilishi mumkin.`,
			`“Oʻzi uchun savol”ga esa uni ochgan o‘yinchining o‘zi javob beradi.`,
			`O‘yinda final raundi ham bo‘lishi mumkin, unda har bir o‘yinchi badal tikadi. Savol o‘qib eshittiriladi, o‘ylash uchun vaqt beriladi
        va har bir o‘yinchi o‘z javobini yozma ravishda topshiradi. So‘ng to‘g‘ri javob e’lon qilinadi va har bir o‘yinchi ball yutadi yoki boy beradi.`,
			`Oxirgi savoldan so‘ng eng ko‘p ball to‘plagan o‘yinchi o‘yin g‘olibi deb topiladi.`,
			`Oʻyin tugmasini, shuningdek, belgilangan klavisha yoki sichqonchaning o‘ng tugmasi yordamida ham faollashtirish mumkin.`,
			`O‘yin qoidalari juda oddiy: savollar mavzularga bo‘lingan, har birining o‘z qiymati bor. Tugmani birinchi bosgan o‘yinchi javob beradi. To‘g‘ri javobda qiymat hisobga qo‘shiladi, noto‘g‘ri bo‘lsa — chegiriladi.`,
			`O‘yinda maxsus savollar ham bor. Stavkali savolda eng yuqori stavkani tikkan o‘yinchi javob beradi. Va-bankni faqat boshqa Va-bank bilan qaytarish mumkin.`,
			`Sirli savolni ochgan ishtirokchi uni boshqasiga o‘tkazadi. Qabul qilgan o‘yinchi savol qiymatini tanlaydi va javob beradi.`,
			'O‘zi uchun savolga uni ochgan o‘yinchining o‘zi javob beradi.',
			`Final raundida har bir o‘yinchi stavka tikadi. Savol o‘qiladi, o‘ylash vaqti beriladi va har bir o‘yinchi javobini yozma topshiradi.`,
			'Oxirgi savoldan so‘ng eng ko‘p ball to‘plagan o‘yinchi g‘olib bo‘ladi.',
			'O‘yin tugmasini belgilangan klavisha yoki sichqonchaning o‘ng tugmasi bilan ham faollashtirish mumkin.'
		],
		aboutAuthor: 'Muallif',
		aboutSupport: 'Texnik yordam',
		acceptLicense: 'Litsenziyani qabul qilish',
		appName: 'SIGame',
		appTagline: 'Ko‘p ishtirokchili onlayn viktorina. Tez o‘yla, birinchi javob ber!',
		authorInfo: 'Vladimir Xil',
		composer: 'Bastakor',
		copyText: 'Matnni buferga nusxalash',
		donate: 'Xayriya',
		donateComment: `Xayriyalar majburiy emas va faqat xosting hamda domen uchun to‘lovlarga sarflanadi.
Loyiha notijorat bo‘lib, ta’lim maqsadlarida yaratilgan.
O‘yinning barcha funksiyalari bepul — xayriyalar o‘yin jarayoniga ta’sir qilmaydi
va qo‘shimcha imkoniyatlarni ochish uchun ishlatilmaydi. Qo‘llab-quvvatlaganingiz uchun tashakkur!`,
		enter: 'Kirish',
		errorHappened: 'Xato',
		gameAuthor: 'Dastur muallifi',
		gameLoading: 'o‘yin yuklanmoqda…',
		howToPlay: 'Qanday o‘ynayman?',
		connectingToServer: 'serverga ulanilmoqda…',
		joinLobby: 'Onlayn o‘yin',
		license: 'Litsenziya',
		licenseInfo: 'Litsenziya sharti: muallifni ko‘rsatgan holda o‘yindan har qancha foydalanishga ruxsat beriladi.',
		noWarranty: `O‘yin bepul tarqatiladi. Muallif o‘yinning ixtiyoriy sharoitlarda to‘g‘ri ishlashiga kafolat bermaydi
va undan foydalanishning har qanday oqibatlari uchun javobgarlikni o‘z zimmasiga olmaydi.`,
		questionEditor: 'Savol muharriri',
		reloadPage: 'Sahifani yangilash',
		singlePlay: 'Yakkalik o‘yin',
		sourcesInfo: 'O‘yinning kodlari sahifasi.',
		supportInfo: 'Yordam sahifasi.',
		usedComponents: 'O‘yin komponentlari va litsenziyalar:',
		aboutTitle: 'o‘yin haqida',
		appUser: 'SIGame',
		contactUri: 'Mualliflar bilan bog‘lanish',
		cookiesConfirm: 'Qabul qilish',
		cookiesWarning: 'Bu ilova cookie-fayllardan foydalanadi.',
		copyrightIssue: 'Mualliflik huquqi muammosi',
		creatingGame: 'o‘yin yaratilmoqda…',
		donateServersHosting: 'XAYRIYA: rivojlantirish, hosting',
		fullScreen: 'To‘liq ekran rejimi',
		html: 'HTML',
		images: 'Rasmlar',
		info: 'Ma’lumot',
		language: 'Til',
		languageEn: 'English',
		languageRu: 'Русский',
		languageSr: 'Srpski',
		languageUz: 'O‘zbek',
		languageEs: 'Español',
		loading: 'Yuklanmoqda',
		logo: 'Logotip',
		news: 'Yangiliklar',
		unsupportedBrowser: 'Brauzeringiz qo‘llab-quvvatlanmaydi. Iltimos, yangilang yoki almashtiring',
		youAreKicked: 'Siz o‘yindan chetlatildingiz!',
	},
	es: {
		about: [
			'SIGame es un concurso intelectual en el que todos pueden poner a prueba sus conocimientos y velocidad de reacción y competir contra oponentes.',
			`Las reglas del juego son muy sencillas: todas las preguntas del juego están divididas en temas,
			 y cada pregunta del tema tiene su propio precio.
			 Cada jugador tiene una puntuación personal, que al comienzo del juego es 0.
			 Se presenta una pregunta, tras lo cual aparece un marco en la pantalla indicando que se puede pulsar el botón y responder.
			 Si el jugador conoce la respuesta, puede pulsar el botón rojo. El jugador que pulse el botón antes que los demás
			 (y no tenga un falso comienzo), da una respuesta. Si la respuesta es correcta, el precio de la pregunta se suma a la puntuación del jugador;
			 de lo contrario, el precio se resta de la puntuación.
			 En este último caso, los demás jugadores pueden probar suerte y pulsar el botón para responder.`,
			`También hay preguntas especiales en el juego.
			En la "Pregunta con apuesta" los participantes pujan por una pregunta, y el jugador con la apuesta más alta responde.
			En este caso, la apuesta "All-in" (la apuesta igual a toda la puntuación del jugador) solo puede ser superada por otro "All-in".`,
			`La "Pregunta secreta" debe entregarse a otro jugador.
			El jugador que la recibe debe (si está incluido en la pregunta) elegir el precio de la pregunta y responderla.
			El tema de la pregunta puede diferir del tema principal en el que se abrió la pregunta.`,
			'"Pregunta para ti mismo" la responde el jugador que la abrió.',
			`El juego también puede tener una ronda final en la que cada uno de los jugadores hace una apuesta.
			Se formula una pregunta, se da tiempo para pensar y cada uno de los jugadores envía su respuesta al presentador.
			Después se anuncia la respuesta correcta y cada uno de los jugadores recibe o pierde dinero según su apuesta.`,
			'El ganador del juego es el jugador con la puntuación más alta después de la última pregunta.',
			'El botón del juego también se puede activar usando la tecla especificada o el botón derecho del ratón.'
		],
		aboutAuthor: 'Autor',
		aboutSupport: 'Soporte técnico',
		acceptLicense: 'Aceptar licencia',
		appName: 'SIGame',
		appTagline: 'Juego de trivia multijugador en línea. ¡Piensa rápido, responde primero!',
		authorInfo: 'Vladimir Khil',
		composer: 'Compositor',
		copyText: 'Copiar texto al portapapeles',
		donate: 'Donar',
		donateComment: `Las donaciones son opcionales y se utilizan exclusivamente para cubrir los gastos de alojamiento y dominio.
El proyecto es no comercial y existe con fines educativos.
Toda la funcionalidad del juego está disponible de forma gratuita: las donaciones no afectan al juego ni otorgan acceso a funciones adicionales. ¡Gracias por tu apoyo!`,
		enter: 'Iniciar sesión',
		errorHappened: 'Error',
		gameAuthor: 'Autor del juego',
		gameLoading: 'Cargando juego…',
		howToPlay: 'Cómo jugar',
		connectingToServer: 'Conectando al servidor…',
		joinLobby: 'Juego en línea',
		license: 'Licencia',
		licenseInfo: 'Licencia: se permite cualquier uso del juego con la condición de atribución.',
		noWarranty: `El juego se distribuye de forma gratuita.
		El autor no garantiza el correcto funcionamiento del juego en condiciones arbitrarias
		y no es responsable de ninguna consecuencia del uso del juego.`,
		questionEditor: 'Editor de preguntas',
		reloadPage: 'Recargar página',
		singlePlay: 'Juego individual',
		sourcesInfo: 'Página del código fuente del juego.',
		supportInfo: 'Página de soporte.',
		usedComponents: 'Componentes del juego y licencias:',
		aboutTitle: 'Acerca de',
		appUser: 'SIGame',
		contactUri: 'Contacto de los autores',
		cookiesConfirm: 'Aceptar cookies',
		cookiesWarning: 'Esta aplicación utiliza cookies. Si permaneces en esta página, aceptas eso',
		copyrightIssue: 'Problema de derechos de autor',
		creatingGame: 'Creando juego…',
		donateServersHosting: 'DONAR: desarrollo, alojamiento',
		fullScreen: 'Modo de pantalla completa',
		html: 'HTML',
		images: 'Imágenes',
		info: 'Info',
		language: 'Idioma',
		languageEn: 'English',
		languageRu: 'Русский',
		languageSr: 'Srpski',
		languageUz: 'O‘zbek',
		languageEs: 'Español',
		loading: 'Cargando',
		logo: 'Logo',
		news: 'Noticias',
		unsupportedBrowser: 'Tu navegador no es compatible. Por favor, actualízalo o reemplázalo',
		youAreKicked: '¡Has sido expulsado del juego!',
	},
};

export default appLocalization;
