"""
Generate diploma report.
"""

import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from doc_utils import *

OUTPUT = os.path.join(os.path.dirname(__file__), 'Дипломна_робота_Раделицький.docx')


def title_page(doc):
    add_centered_text(doc, 'Міністерство освіти і науки України', size=14)
    add_centered_text(doc, 'Національний університет «Львівська політехніка»', bold=True, size=14)
    add_centered_text(doc, 'Інститут просторового планування та перспективних технологій', size=14)
    add_centered_text(doc, 'Кафедра інформаційних систем та технологій', size=14)

    add_empty_paragraph(doc, 3)

    add_centered_text(doc, 'ДИПЛОМНА РОБОТА', bold=True, size=20)
    add_centered_text(doc, 'на здобуття освітнього ступеня «бакалавр»', size=14)

    add_empty_paragraph(doc, 1)

    add_centered_text(doc, 'на тему:', size=14)
    add_centered_text(doc, '«Розроблення web-орієнтованої системи підтримки продажів', bold=True, size=14)
    add_centered_text(doc, 'малого бізнесу з функціями обліку товарів, замовлень', bold=True, size=14)
    add_centered_text(doc, 'та клієнтської бази»', bold=True, size=14)

    add_empty_paragraph(doc, 2)

    add_right_text(doc, 'Студент групи КНМС-41')
    add_right_text(doc, 'спеціальності 122 «Комп\'ютерні науки»')
    add_right_text(doc, 'Раделицький В. В. ___________')

    add_empty_paragraph(doc, 1)
    add_right_text(doc, 'Керівник дипломної роботи:')
    add_right_text(doc, '________________________________')
    add_empty_paragraph(doc, 1)
    add_right_text(doc, 'Рецензент:')
    add_right_text(doc, '________________________________')

    add_empty_paragraph(doc, 3)
    add_centered_text(doc, 'Львів, 2026', bold=True)
    add_page_break(doc)


def assignment_page(doc):
    add_centered_text(doc, 'Національний університет «Львівська політехніка»', bold=True, size=14)
    add_centered_text(doc, 'Інститут просторового планування та перспективних технологій', size=12)
    add_centered_text(doc, 'Кафедра інформаційних систем та технологій', size=12)
    add_empty_paragraph(doc, 1)

    add_right_text(doc, 'ЗАТВЕРДЖУЮ', bold=True)
    add_right_text(doc, 'Завідувач кафедри')
    add_right_text(doc, '_________ _______________')
    add_right_text(doc, '«___» ____________ 2026 р.')
    add_empty_paragraph(doc, 1)

    add_centered_text(doc, 'З А В Д А Н Н Я', bold=True, size=16)
    add_centered_text(doc, 'НА ДИПЛОМНУ РОБОТУ СТУДЕНТУ', bold=True, size=14)
    add_empty_paragraph(doc, 1)

    add_body(doc, 'Раделицькому В\'ячеславу Володимировичу')

    add_body_mixed(doc, [
        ('1. Тема роботи: ', True),
        ('«Розроблення web-орієнтованої системи підтримки продажів малого бізнесу '
         'з функціями обліку товарів, замовлень та клієнтської бази».', False),
    ])

    add_body_mixed(doc, [('Керівник: ', True), ('________________________________', False)])
    add_body(doc, 'Затверджено наказом по університету від «___» ____________ 2026 р.')

    add_body_mixed(doc, [('2. Строк подання: ', True), ('«___» ____________ 2026 р.', False)])

    add_body_mixed(doc, [
        ('3. Вихідні дані: ', True),
        ('технічне завдання на розробку веб-системи; '
         'вимоги до функціональності (каталог, замовлення, клієнтська база, аналітика); '
         'результати аналізу предметної області.', False),
    ])

    add_body_mixed(doc, [('4. Зміст пояснювальної записки:', True), ('', False)])
    add_dash_list(doc, [
        'аналіз предметної області електронної комерції;',
        'порівняльний аналіз аналогічних систем і технологій;',
        'формулювання вимог до системи;',
        'проектування архітектури, БД та інтерфейсу;',
        'реалізація серверної і клієнтської частин;',
        'тестування та документування.',
    ])

    add_body_mixed(doc, [('5. Графічний матеріал:', True), ('', False)])
    add_dash_list(doc, [
        'діаграма варіантів використання;',
        'діаграма класів;',
        'діаграма розгортання;',
        'ER-діаграма бази даних;',
        'знімки екранів інтерфейсу.',
    ])

    add_body_mixed(doc, [('6. Календарний план:', True), ('', False)])
    add_table(doc, '',
        ['No', 'Етап', 'Термін', 'Примітка'],
        [
            ['1', 'Отримання завдання', '__.__.2026', ''],
            ['2', 'Аналіз предметної області', '__.__.2026', ''],
            ['3', 'Вибір технологій', '__.__.2026', ''],
            ['4', 'Проектування архітектури', '__.__.2026', ''],
            ['5', 'Проектування БД', '__.__.2026', ''],
            ['6', 'Розробка серверної частини', '__.__.2026', ''],
            ['7', 'Розробка клієнтської частини', '__.__.2026', ''],
            ['8', 'Тестування', '__.__.2026', ''],
            ['9', 'Написання пояснювальної записки', '__.__.2026', ''],
            ['10', 'Підготовка презентації', '__.__.2026', ''],
        ])

    add_left_text(doc, 'Студент  ____________  Раделицький В. В.', indent=1.25)
    add_left_text(doc, 'Керівник  ____________  _______________', indent=1.25)
    add_page_break(doc)


def annotation(doc):
    add_unnumbered_heading(doc, 'Анотація')

    add_body(doc,
        'Раделицький В. В. Розроблення web-орієнтованої системи підтримки продажів '
        'малого бізнесу з функціями обліку товарів, замовлень та клієнтської бази. '
        'Дипломна робота на здобуття ступеня «бакалавр» за спеціальністю '
        '122 «Комп\'ютерні науки». Національний університет «Львівська політехніка», '
        'Львів, 2026.')

    add_body(doc,
        'Об\'єкт дослідження: процеси управління продажами '
        'на підприємстві малого бізнесу в сфері торгівлі електронікою.')

    add_body(doc,
        'Предмет дослідження: методи і засоби розроблення веб-систем '
        'електронної комерції з функціями обліку товарів, обробки замовлень '
        'та ведення клієнтської бази.')

    add_body(doc,
        'Мета роботи: розробити веб-систему підтримки продажів '
        'для малого бізнесу, що автоматизує управління каталогом, '
        'обробку замовлень з онлайн-оплатою, ведення клієнтської бази '
        'з рольовою моделлю доступу та аналітику продажів.')

    add_body(doc,
        'У першому розділі проаналізовано предметну область, досліджено '
        'аналогічні системи, проведено огляд технологій розробки.')

    add_body(doc,
        'У другому розділі виконано проектування: розроблено UML-діаграми, '
        'обрано технологічний стек, спроектовано інтерфейс і базу даних.')

    add_body(doc,
        'У третьому розділі описано реалізацію серверної і клієнтської '
        'частин, проведено тестування, розроблено інструкцію користувача.')

    add_body_mixed(doc, [
        ('Ключові слова: ', True),
        ('веб-система, електронна комерція, малий бізнес, REST API, '
         'FastAPI, React, PostgreSQL, Docker, LiqPay.', False),
    ])

    add_page_break(doc)

    add_unnumbered_heading(doc, 'Abstract')

    add_body(doc,
        'Radelytskyi V. V. Development of a Web-Based System for Small Business '
        'Sales Support with Inventory Management, Order Processing and Customer '
        'Database Functions. Bachelor\'s thesis, specialty 122 "Computer Science". '
        'Lviv Polytechnic National University, Lviv, 2026.')

    add_body(doc,
        'Research object: sales management processes in small electronics '
        'retail businesses.')

    add_body(doc,
        'Research subject: methods and tools for developing web-based '
        'e-commerce systems with product catalog, order processing '
        'and customer database features.')

    add_body(doc,
        'The first chapter analyzes the e-commerce domain, examines '
        'similar systems, and reviews web development technologies. '
        'The second chapter covers system design: UML diagrams, '
        'technology selection, GUI and database design. '
        'The third chapter describes implementation, testing '
        'and user instructions.')

    add_body_mixed(doc, [
        ('Keywords: ', True),
        ('web system, e-commerce, small business, REST API, FastAPI, '
         'React, PostgreSQL, Docker, LiqPay.', False),
    ])

    add_page_break(doc)


def abbreviations(doc):
    add_unnumbered_heading(doc, 'Перелік скорочень')

    items = [
        ('API', 'Application Programming Interface'),
        ('ASGI', 'Asynchronous Server Gateway Interface'),
        ('БД', 'база даних'),
        ('CORS', 'Cross-Origin Resource Sharing'),
        ('CRUD', 'Create, Read, Update, Delete'),
        ('HTML', 'HyperText Markup Language'),
        ('HTTP', 'HyperText Transfer Protocol'),
        ('JSON', 'JavaScript Object Notation'),
        ('JWT', 'JSON Web Token'),
        ('ORM', 'Object-Relational Mapping'),
        ('ПЗ', 'програмне забезпечення'),
        ('RBAC', 'Role-Based Access Control'),
        ('REST', 'Representational State Transfer'),
        ('SPA', 'Single Page Application'),
        ('SQL', 'Structured Query Language'),
        ('СУБД', 'система управління базами даних'),
        ('UML', 'Unified Modeling Language'),
    ]

    for abbr, desc in items:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.first_line_indent = Cm(1.25)
        p.paragraph_format.line_spacing = 1.5
        r1 = p.add_run(abbr)
        r1.bold = True
        r1.font.size = Pt(14)
        r1.font.name = 'Times New Roman'
        r2 = p.add_run(f' – {desc}')
        r2.font.size = Pt(14)
        r2.font.name = 'Times New Roman'

    add_page_break(doc)


def introduction(doc):
    add_unnumbered_heading(doc, 'Вступ')

    add_body(doc,
        'Малий бізнес в Україні все активніше переходить в онлайн. '
        'Кількість підприємців, що використовують інтернет-торгівлю, '
        'за 2023-2025 роки зросла приблизно на 35%. Для невеликих компаній '
        'наявність веб-магазину стала не перевагою, а необхідністю [1].')

    add_body(doc,
        'Ринок електроніки особливо конкурентний. Покупці звикли до зручного '
        'пошуку, фільтрації, онлайн-оплати і відстежування доставки. '
        'Малий бізнес, що хоче конкурувати, повинен давати порівнянний '
        'рівень сервісу.')

    add_body(doc,
        'Існуючі рішення не повністю підходять для малого бізнесу. '
        'Маркетплейси беруть комісію і не дають контролю над клієнтами. '
        'SaaS-платформи обмежують кастомізацію. Фреймворки з відкритим кодом '
        '(WooCommerce) потребують технічної експертизи для налаштування [2].')

    add_body(doc,
        'Об\'єкт дослідження: процеси управління продажами на підприємстві '
        'малого бізнесу в сфері торгівлі електронікою.')

    add_body(doc,
        'Предмет дослідження: методи і засоби розроблення веб-систем '
        'електронної комерції, архітектура REST API, технології побудови '
        'інтерфейсів, проектування реляційних БД.')

    add_body(doc,
        'Мета роботи: розробити веб-систему «TechBox» для підтримки продажів '
        'малого бізнесу, що автоматизує каталог, замовлення, клієнтську базу '
        'і аналітику.')

    add_body(doc, 'Завдання роботи:')

    add_numbered_list(doc, [
        'проаналізувати предметну область і бізнес-процеси;',
        'провести порівняльний аналіз аналогічних систем;',
        'дослідити технології розробки і обрати стек;',
        'спроектувати архітектуру, БД і інтерфейс;',
        'реалізувати серверну частину з REST API;',
        'реалізувати клієнтський інтерфейс і адмін-панель;',
        'інтегрувати платіжну систему і AI-модуль;',
        'провести тестування і написати інструкцію.',
    ])

    add_body(doc,
        'Методи: аналіз предметної області, порівняльний аналіз, '
        'об\'єктно-орієнтоване проектування (UML), REST, '
        'компонентний підхід до розробки інтерфейсу.')

    add_body(doc,
        'Робота складається зі вступу, трьох розділів, висновків, '
        'списку джерел і додатків.')

    add_page_break(doc)


def section1(doc):
    add_section_heading(doc, 1,
        'Аналіз предметної області, методів та задач розроблення веб-системи')

    add_subsection_heading(doc, '1.1', 'Аналіз об\'єкта автоматизації')

    add_body(doc,
        'Об\'єктом автоматизації є діяльність ФОП Раделицький В. В. '
        'Підприємство торгує електронікою через інтернет, фізичний '
        'магазин відсутній. Веб-платформа є єдиним каналом продажів.')

    add_body(doc,
        'Бізнес-процеси підприємства поділяються на п\'ять груп. '
        'Перша група стосується каталогу товарів: додавання позицій, '
        'оновлення цін і залишків, категоризація, формування описів. '
        'Раніше каталог вівся в таблицях, що не давало контролю '
        'над залишками і не дозволяло будувати зручну вітрину.')

    add_body(doc,
        'Друга група це обробка замовлень. Цикл замовлення: запит '
        'від клієнта, фіксація товарів і кількості, збір контактних даних, '
        'вибір оплати і доставки, відстежування статусу '
        '(нове, в обробці, відправлене, доставлене, скасоване). '
        'Ручне ведення через месенджери призводило до помилок '
        'і втрати інформації.')

    add_body(doc,
        'Третя група це клієнтська база: ім\'я, телефон, email, '
        'історія покупок, загальна сума. Централізованого зберігання '
        'цих даних не було, тому аналіз повторних покупок був неможливий.')

    add_body(doc,
        'Четверта група це аналітика: виручка за період, кількість замовлень, '
        'середній чек, топ товарів. Все раховане вручну раз на місяць.')

    add_body(doc,
        'П\'ята група це маркетинг: промокоди, відгуки, AI-описи товарів. '
        'Раніше ці процеси або не здійснювались, або велись неформалізовано.')

    add_subsection_heading(doc, '1.2', 'Аналіз аналогічних систем')

    add_body(doc,
        'Для визначення функціональних меж системи проаналізовано '
        'п\'ять існуючих рішень.')

    add_body(doc,
        'Rozetka (rozetka.ua) це найбільший маркетплейс України. '
        'Має потужну фільтрацію, персоналізацію, власну логістику. '
        'Для продавця це означає комісію 5-15% і відсутність контролю '
        'над клієнтською базою [3].')

    add_body(doc,
        'Jabko.ua торгує технікою Apple. Має чистий дизайн, '
        'але без аналітики, промокодів і рольової моделі [4].')

    add_body(doc,
        'Moyo.ua прив\'язаний до фізичної мережі магазинів. '
        'Стороннього продавця не обслуговує.')

    add_body(doc,
        'Shopify це SaaS-платформа з підпискою від $29/міс. '
        'Швидкий запуск, але обмежена кастомізація серверної логіки, '
        'комісія за транзакції і складна інтеграція з українськими '
        'платіжними системами [5].')

    add_body(doc,
        'WooCommerce це безкоштовний плагін для WordPress. '
        'Великий магазин плагінів, але застаріла архітектура на PHP, '
        'повільна швидкодія при великій кількості товарів [6].')

    add_table(doc, 'Таблиця 1.1. Порівняння аналогічних систем',
        ['Критерій', 'Rozetka', 'Shopify', 'WooCommerce', 'TechBox'],
        [
            ['Вартість', 'Комісія', '$29-299/міс', 'Безкоштовно', 'Безкоштовно'],
            ['Каталог', '+', '+', '+', '+'],
            ['Оплата (LiqPay)', '+', 'Складно', 'Плагін', '+'],
            ['RBAC', '+', '+', 'Плагін', '+ (4 ролі)'],
            ['Аналітика', '+', '+', 'Плагін', '+'],
            ['AI-описи', '', '', '', '+ (Gemini)'],
            ['Контроль даних', '', 'Частковий', '+', '+'],
            ['Docker', '', '', 'Можливо', '+'],
        ])

    add_body(doc,
        'TechBox поєднує контроль над кодом і даними (як WooCommerce), '
        'сучасний стек (FastAPI + TypeScript) і вбудовану AI-функціональність, '
        'якої немає в жодному з розглянутих аналогів.')

    add_subsection_heading(doc, '1.3', 'Аналіз веб-технологій')

    add_body(doc,
        'Для серверної частини розглянуто п\'ять фреймворків: '
        'Django, Flask, FastAPI (Python), Express.js і NestJS (JavaScript).')

    add_body(doc,
        'Django має вбудовану ORM, систему авторизації і адмін-панель. '
        'Проте він монолітний, асинхронність обмежена, '
        'а для API-проектів надлишковий [7].')

    add_body(doc,
        'Flask дає мінімальний набір інструментів. Для великого API '
        'потрібно багато сторонніх бібліотек, вбудованої валідації немає [8].')

    add_body(doc,
        'FastAPI побудований на ASGI і Pydantic. Автоматично генерує '
        'OpenAPI-документацію, валідує дані через type hints, працює '
        'асинхронно. Продуктивність порівнянна з Go і Node.js [9].')

    add_body(doc,
        'Express.js це стандарт для серверного JavaScript. '
        'Middleware-архітектура, великий npm. Але немає типізації '
        'без TypeScript, немає стандартної ORM [10].')

    add_body(doc,
        'NestJS використовує TypeScript і концепції з Angular. '
        'Потужний, але крива навчання висока, для малого проекту надлишковий [11].')

    add_table(doc, 'Таблиця 1.2. Порівняння серверних фреймворків',
        ['Критерій', 'Django', 'Flask', 'FastAPI', 'Express', 'NestJS'],
        [
            ['Продуктивність', 'Середня', 'Середня', 'Висока', 'Висока', 'Висока'],
            ['Типізація', 'Обмежена', 'Немає', 'Pydantic', 'Опціонально', 'Вбудована'],
            ['Автодокументація', 'DRF', 'Немає', 'OpenAPI', 'Немає', 'Swagger'],
            ['Асинхронність', 'Часткова', 'Немає', 'Нативна', 'Нативна', 'Нативна'],
            ['Крива навчання', 'Середня', 'Низька', 'Низька', 'Низька', 'Висока'],
        ])

    add_body(doc,
        'Обрано FastAPI за баланс продуктивності і зручності розробки.')

    add_body(doc,
        'Для фронтенду порівнювались React, Vue.js і Angular. '
        'React має найбільшу екосистему і спільноту. TypeScript додає '
        'типобезпеку. Vite 8 забезпечує швидкий запуск [12].')

    add_subsection_heading(doc, '1.4', 'Аналіз технологій баз даних')

    add_body(doc,
        'Для e-commerce, де дані структуровані (товари, замовлення, '
        'користувачі), реляційні БД підходять найкраще.')

    add_body(doc,
        'PostgreSQL 16 це надійна СУБД з підтримкою JSONB '
        '(для AI-специфікацій), повнотекстового пошуку і транзакцій MVCC. '
        'Використовується Instagram, Spotify, Apple [13].')

    add_body(doc,
        'MySQL простіша у налаштуванні, але поступається PostgreSQL '
        'у роботі з JSON і масштабуванні під навантаженням.')

    add_body(doc,
        'MongoDB зберігає документи у BSON. Ефективна для слабо '
        'структурованих даних, але для e-commerce з транзакціями '
        'і зв\'язками (замовлення-товар) реляційна модель надійніша.')

    add_table(doc, 'Таблиця 1.3. Порівняння СУБД',
        ['Критерій', 'PostgreSQL', 'MySQL', 'MongoDB'],
        [
            ['Тип', 'Реляційна', 'Реляційна', 'Документна'],
            ['JSON', 'JSONB (повна)', 'Базова', 'Нативна'],
            ['Транзакції', 'Повні ACID', 'ACID', 'Обмежені'],
            ['Повнотекстовий пошук', 'Вбудований', 'Вбудований', 'Atlas Search'],
        ])

    add_body(doc,
        'Обрано PostgreSQL 16. ORM: SQLAlchemy 2.0, '
        'що підтримує декларативний опис моделей і інтеграцію '
        'з Alembic для міграцій [14].')

    add_subsection_heading(doc, '1.5', 'Вимоги до програмного забезпечення')

    add_body(doc,
        'Вимоги сформульовано з урахуванням стандарту ISO/IEC 25010 [15].')

    add_body(doc,
        'Функціональна придатність: реєстрація з верифікацією email, '
        'каталог з фільтрацією, кошик, оформлення замовлення, оплата LiqPay, '
        'управління статусами, відгуки, промокоди, аналітика, AI-описи.')

    add_body(doc,
        'Ефективність: час відповіді API до 500 мс, '
        '100 одночасних користувачів.')

    add_body(doc,
        'Безпека: bcrypt для паролів, JWT з обмеженим терміном, '
        'RBAC з чотирма рівнями, HMAC-SHA1 для LiqPay.')

    add_body(doc,
        'Зручність: інтуїтивний інтерфейс, адаптивність, '
        'українська мова.')

    add_body(doc,
        'Переносимість: розгортання через Docker Compose '
        'на будь-якому сервері з Docker.')

    add_subsection_heading(doc, '', 'Висновки до розділу 1')

    add_body(doc,
        'У першому розділі проаналізовано предметну область. '
        'Визначено п\'ять груп бізнес-процесів для автоматизації. '
        'Порівняно п\'ять аналогічних систем. Жодна з них '
        'не поєднує контроль над даними, сучасний стек і AI.')

    add_body(doc,
        'Обрано стек: FastAPI, React 19 (TypeScript), PostgreSQL 16, '
        'SQLAlchemy 2.0, Docker Compose. Сформульовано вимоги.')

    add_page_break(doc)


def section2(doc):
    add_section_heading(doc, 2, 'Проектування веб-системи')

    add_subsection_heading(doc, '2.1', 'Формулювання вимог до системи')

    add_body(doc,
        'Визначено чотирьох акторів системи. Рольова модель побудована '
        'за ієрархічним принципом: кожна наступна роль має права попередньої.')

    add_body(doc,
        'Покупець (customer) переглядає каталог, додає товари до кошика, '
        'оформлює замовлення, залишає відгуки на куплені товари, '
        'керує профілем. Потрібна верифікація email.')

    add_body(doc,
        'Менеджер (manager) додатково створює і редагує товари, '
        'змінює статуси замовлень.')

    add_body(doc,
        'Адміністратор (admin) має доступ до аналітики, промокодів, '
        'управління користувачами, може видаляти товари.')

    add_body(doc,
        'Суперадміністратор (superadmin) призначає роль admin '
        'іншим користувачам, має повний доступ.')

    add_figure_placeholder(doc, 'Рисунок 2.1. Діаграма варіантів використання')

    add_table(doc, 'Таблиця 2.1. Деталізовані вимоги',
        ['ID', 'Вимога', 'Актор', 'Пріоритет'],
        [
            ['UC-01', 'Реєстрація з верифікацією email', 'Анонімний', 'Високий'],
            ['UC-02', 'Авторизація (JWT)', 'Всі', 'Високий'],
            ['UC-03', 'Каталог з фільтрацією', 'Всі', 'Високий'],
            ['UC-04', 'Кошик', 'Покупець', 'Високий'],
            ['UC-05', 'Оформлення замовлення', 'Покупець', 'Високий'],
            ['UC-06', 'Оплата LiqPay', 'Покупець', 'Високий'],
            ['UC-07', 'Відгуки', 'Покупець', 'Середній'],
            ['UC-08', 'CRUD товарів', 'Менеджер+', 'Високий'],
            ['UC-09', 'Статуси замовлень', 'Менеджер+', 'Високий'],
            ['UC-10', 'Аналітика', 'Адмін+', 'Високий'],
            ['UC-11', 'Промокоди', 'Адмін+', 'Середній'],
            ['UC-12', 'Управління користувачами', 'Адмін+', 'Високий'],
        ])

    add_subsection_heading(doc, '2.2', 'Розроблення UML-діаграм')

    add_body(doc,
        'Діаграма класів (рис. 2.2) відображає шість сутностей системи, '
        'що відповідають таблицям БД.')

    add_body(doc,
        'User має поля: id, name, email, phone, password_hash, '
        'role (UserRole), is_verified, verification_token, '
        'token_expires_at, created_at. Зв\'язки 1:N з Order і ProductReview.')

    add_body(doc,
        'Product: id, name, price, old_price, img, badge, category, '
        'stock, ai_description, ai_specs (JSON), ai_generated_at, created_at. '
        'Зв\'язок 1:N з ProductReview (каскадне видалення).')

    add_body(doc,
        'Order: user_id (FK), status (OrderStatus: new, processing, '
        'shipped, delivered, cancelled), total, promo_code, discount, '
        'контактні дані (name, surname, phone, email, address, comment), '
        'payment_method, delivery_method, payment_status. '
        'Зв\'язок 1:N з OrderItem.')

    add_body(doc,
        'OrderItem зберігає знімок даних на момент покупки: product_name, '
        'qty, price. Поле product_id має стратегію SET NULL при видаленні '
        'товару, щоб зберегти історію замовлень.')

    add_body(doc,
        'ProductReview: product_id (CASCADE), user_id (CASCADE), '
        'rating (1-5), comment. PromoCode: code (унікальний), '
        'discount_percent або discount_amount, max_uses, used_count, '
        'is_active, expires_at.')

    add_figure_placeholder(doc, 'Рисунок 2.2. Діаграма класів')

    add_body(doc,
        'Діаграма послідовності (рис. 2.3) показує процес оформлення '
        'замовлення: покупець надсилає POST /api/orders, API перевіряє JWT, '
        'валідує промокод, створює запис в orders і order_items, '
        'оновлює used_count промокоду. Якщо обрано оплату карткою, '
        'клієнт запитує POST /api/liqpay/create-payment, API формує '
        'підписаний запит, клієнт перенаправляється на LiqPay, '
        'callback оновлює payment_status.')

    add_figure_placeholder(doc, 'Рисунок 2.3. Діаграма послідовності (оформлення замовлення)')

    add_body(doc,
        'Діаграма компонентів (рис. 2.4): три основні компоненти '
        '(Client App на порту 5182, Admin App на 5183, API Server на 4000). '
        'API має дев\'ять модулів: auth, products, orders, users, '
        'promocodes, reviews, analytics, ai, liqpay. '
        'Зовнішні інтеграції: LiqPay API, Google Gemini API, SMTP.')

    add_figure_placeholder(doc, 'Рисунок 2.4. Діаграма компонентів')

    add_body(doc,
        'Діаграма розгортання (рис. 2.5): Docker Compose оркеструє '
        'чотири контейнери. db (postgres:16-alpine, порт 5433), '
        'api (Python + uvicorn, порт 4000, залежить від db), '
        'client (Node.js + Vite, порт 5182), '
        'admin (Node.js + Vite, порт 5183). '
        'Volume pgdata зберігає дані БД.')

    add_figure_placeholder(doc, 'Рисунок 2.5. Діаграма розгортання')

    add_subsection_heading(doc, '2.3', 'Вибір технологій та програмних засобів')

    add_table(doc, 'Таблиця 2.2. Технологічний стек',
        ['Компонент', 'Технологія', 'Версія'],
        [
            ['Backend', 'Python + FastAPI', '3.13 / 0.136.0'],
            ['Веб-сервер', 'Uvicorn', '0.34.2'],
            ['ORM', 'SQLAlchemy', '2.0.49'],
            ['Міграції', 'Alembic', '1.18.4'],
            ['Валідація', 'Pydantic', '2.x'],
            ['Автентифікація', 'python-jose + bcrypt', ''],
            ['СУБД', 'PostgreSQL', '16-alpine'],
            ['Frontend', 'React + TypeScript', '19.2.4 / 6.0.2'],
            ['Маршрутизація', 'React Router', '7.14.1'],
            ['Збірник', 'Vite', '8.0.4'],
            ['Контейнеризація', 'Docker Compose', ''],
            ['Платежі', 'LiqPay SDK', ''],
            ['AI', 'Google Gemini API', ''],
            ['Email', 'fastapi-mail', '1.4.1'],
        ])

    add_body(doc,
        'Середовище розробки: VS Code, Git, Docker Desktop, '
        'Swagger UI для тестування API, Chrome DevTools '
        'для клієнтської частини.')

    add_subsection_heading(doc, '2.4', 'Проектування графічного інтерфейсу')

    add_body(doc,
        'Інтерфейс складається з двох SPA: клієнтський магазин '
        '(порт 5182) і панель адміністрування (порт 5183).')

    add_body(doc,
        'Клієнтський додаток має дванадцять маршрутів. '
        'Головна сторінка: верхня панель, рекламний слайдер, сітка '
        'популярних товарів. Каталог: фільтрація за десятьма категоріями, '
        'пошук, картки товарів з ціною і бейджем. '
        'Товар: зображення, ціна, AI-опис, специфікації, відгуки. '
        'Кошик: зміна кількості, промокод. '
        'Checkout: контактні дані, оплата, доставка. '
        'Авторизація: вхід, реєстрація, верифікація email. '
        'Профіль та історія замовлень.')

    add_body(doc,
        'Адмін-панель захищена компонентом RequireAuth. '
        'П\'ять розділів: аналітика (графіки, KPI), '
        'товари (таблиця з CRUD), замовлення (список зі статусами), '
        'користувачі (ролі), промокоди (створення, деактивація).')

    add_body(doc,
        'Стан додатку керується через React Context: '
        'AuthContext (JWT, дані користувача), '
        'CartContext (товари у кошику, localStorage), '
        'ThemeContext (тема оформлення).')

    add_subsection_heading(doc, '2.5', 'Проектування бази даних')

    add_body(doc,
        'БД має шість таблиць, два enum і п\'ять зв\'язків.')

    add_figure_placeholder(doc, 'Рисунок 2.6. ER-діаграма')

    add_table(doc, 'Таблиця 2.3. Таблиця users',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['name', 'String(255)', 'NOT NULL'],
            ['email', 'String(255)', 'UNIQUE, INDEX'],
            ['phone', 'String(50)', 'NULL'],
            ['password_hash', 'String(255)', 'NOT NULL'],
            ['role', 'Enum(UserRole)', 'DEFAULT customer'],
            ['is_verified', 'Boolean', 'DEFAULT false'],
            ['verification_token', 'String(255)', 'UNIQUE, NULL'],
            ['token_expires_at', 'DateTime', 'NULL'],
            ['created_at', 'DateTime', 'DEFAULT now()'],
        ])

    add_table(doc, 'Таблиця 2.4. Таблиця products',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['name', 'String(500)', 'NOT NULL'],
            ['price', 'Numeric(10,2)', 'NOT NULL'],
            ['old_price', 'Numeric(10,2)', 'NULL'],
            ['img', 'Text', 'NULL'],
            ['badge', 'String(50)', 'NULL'],
            ['category', 'String(100)', 'NOT NULL, INDEX'],
            ['stock', 'Integer', 'DEFAULT 0'],
            ['ai_description', 'Text', 'NULL'],
            ['ai_specs', 'JSON', 'NULL'],
            ['ai_generated_at', 'DateTime', 'NULL'],
            ['created_at', 'DateTime', 'DEFAULT now()'],
        ])

    add_table(doc, 'Таблиця 2.5. Таблиця orders',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['user_id', 'Integer', 'FK users.id'],
            ['status', 'Enum(OrderStatus)', 'DEFAULT new'],
            ['total', 'Numeric(10,2)', 'NOT NULL'],
            ['promo_code', 'String(50)', 'NULL'],
            ['discount', 'Numeric(10,2)', 'DEFAULT 0'],
            ['name, surname', 'String(255)', 'NOT NULL'],
            ['phone, email', 'String', 'NOT NULL'],
            ['address', 'Text', 'NOT NULL'],
            ['payment_method', 'String(100)', 'NOT NULL'],
            ['delivery_method', 'String(100)', 'NOT NULL'],
            ['payment_status', 'String(50)', 'DEFAULT pending'],
            ['created_at', 'DateTime', 'DEFAULT now()'],
        ])

    add_table(doc, 'Таблиця 2.6. Таблиця order_items',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['order_id', 'Integer', 'FK orders.id (CASCADE)'],
            ['product_id', 'Integer', 'FK products.id (SET NULL)'],
            ['product_name', 'String(500)', 'NOT NULL'],
            ['qty', 'Integer', 'NOT NULL'],
            ['price', 'Numeric(10,2)', 'NOT NULL'],
        ])

    add_table(doc, 'Таблиця 2.7. Таблиця product_reviews',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['product_id', 'Integer', 'FK products.id (CASCADE)'],
            ['user_id', 'Integer', 'FK users.id (CASCADE)'],
            ['rating', 'Integer', '1-5'],
            ['comment', 'Text', 'NULL'],
            ['created_at', 'DateTime', 'DEFAULT now()'],
        ])

    add_table(doc, 'Таблиця 2.8. Таблиця promo_codes',
        ['Поле', 'Тип', 'Обмеження'],
        [
            ['id', 'Integer', 'PK'],
            ['code', 'String(50)', 'UNIQUE, INDEX'],
            ['discount_percent', 'Integer', 'NULL'],
            ['discount_amount', 'Numeric(10,2)', 'NULL'],
            ['max_uses', 'Integer', 'NULL'],
            ['used_count', 'Integer', 'DEFAULT 0'],
            ['is_active', 'Boolean', 'DEFAULT true'],
            ['expires_at', 'DateTime', 'NULL'],
            ['created_at', 'DateTime', 'DEFAULT now()'],
        ])

    add_body(doc,
        'Зв\'язки: users до orders (1:N), orders до order_items (1:N, CASCADE), '
        'products до order_items (1:N, SET NULL), '
        'products до product_reviews (1:N, CASCADE), '
        'users до product_reviews (1:N, CASCADE).')

    add_subsection_heading(doc, '', 'Висновки до розділу 2')

    add_body(doc,
        'У другому розділі спроектовано систему. Визначено чотирьох акторів '
        'з ієрархічною рольовою моделлю. Розроблено UML-діаграми. '
        'Обрано стек з чотирнадцяти компонентів. Спроектовано інтерфейс '
        'і БД з шістьма таблицями.')

    add_page_break(doc)


def section3(doc):
    add_section_heading(doc, 3, 'Реалізація та тестування')

    add_subsection_heading(doc, '3.1', 'Опис модулів та класів')

    add_body(doc,
        'Серверна частина написана на Python 3.13 з FastAPI 0.136.0. '
        'Кожна група ресурсів оформлена як окремий router, '
        'що підключається до головного додатку в main.py.')

    add_body(doc,
        'main.py ініціалізує FastAPI з метаданими (TechBox API, v1.0.0), '
        'налаштовує CORS для крос-доменних запитів, підключає дев\'ять '
        'роутерів з префіксом /api, визначає глобальний обробник помилок.')

    add_body(doc,
        'Модуль auth.py: POST /login (перевірка даних, генерація JWT), '
        'POST /register (хешування bcrypt, відправка листа), '
        'GET /verify-email (перевірка токена), '
        'POST /resend-verification, GET /me. '
        'JWT генерується алгоритмом HS256 з терміном 24 години.')

    add_body(doc,
        'Модуль deps.py: get_db() повертає сесію БД, '
        'get_current_user() валідує JWT, '
        'require_roles() перевіряє рольовий доступ.')

    add_body(doc,
        'Модуль products.py (8 ендпоінтів): '
        'GET /products з фільтрацією за category, search, badge. '
        'GET /products/popular сортує за кількістю замовлень. '
        'GET /products/img-proxy проксіює зображення. '
        'CRUD захищений ролями.')

    add_body(doc,
        'Модуль orders.py (4 ендпоінти): '
        'POST /orders валідує промокод (активність, термін, ліміт використань), '
        'створює замовлення і позиції. '
        'PUT /orders/{id}/status змінює статус.')

    add_body(doc,
        'Модуль liqpay.py: POST /create-payment формує Base64-JSON '
        'з підписом HMAC-SHA1. POST /callback верифікує підпис '
        'і оновлює payment_status.')

    add_body(doc,
        'Модуль analytics.py: GET /summary повертає виручку, '
        'кількість замовлень, нових клієнтів, середній чек, '
        'топ-5 товарів. Параметри: start_date, end_date.')

    add_body(doc,
        'Модуль ai.py інтегрується з Google Gemini API. '
        'POST /ai/product-advice приймає назву і категорію, '
        'формує промпт, повертає опис і специфікації. '
        'Кешування 48 годин через поля ai_description, ai_specs.')

    add_body(doc,
        'Модуль reviews.py: GET /can-review/{id} перевіряє право '
        '(доставлене замовлення з товаром, немає існуючого відгуку). '
        'POST створює відгук, DELETE доступний автору або адміну.')

    add_body(doc,
        'Клієнтська частина: React 19, TypeScript, три Context-провайдери. '
        'AuthContext зберігає JWT в localStorage. '
        'CartContext зберігає кошик в localStorage. '
        'ThemeContext керує темою.')

    add_body(doc,
        'Адмін-панель: окремий Vite-проект, спільний API. '
        'RequireAuth перенаправляє на форму входу, '
        'якщо JWT відсутній або роль нижча за admin.')

    add_subsection_heading(doc, '3.2', 'Розроблення та наповнення бази даних')

    add_body(doc,
        'PostgreSQL розгортається як Docker-контейнер (postgres:16-alpine). '
        'При першому запуску створюється база techbox. '
        'Схема створюється через Base.metadata.create_all() при старті API.')

    add_body(doc,
        'Для версіонування використовується Alembic 1.18.4. '
        'Створено дві міграції: початкова (базові таблиці) '
        'і додавання поля ai_specs.')

    add_body(doc,
        'Тестові дані створюються через seed.py: '
        'адміністратор, набір товарів по категоріях, промокоди.')

    add_subsection_heading(doc, '3.3', 'Тестування системи')

    add_body(doc,
        'API тестувалось через Swagger UI (http://localhost:4000/docs). '
        'FastAPI автоматично генерує інтерактивну документацію.')

    add_image(doc, '13_swagger.png', 'Рисунок 3.1. Документація API (Swagger UI)')

    add_table(doc, 'Таблиця 3.1. Сценарії тестування',
        ['No', 'Сценарій', 'Очікуваний результат', 'Статус'],
        [
            ['1', 'Реєстрація з валідними даними', 'Акаунт створено, email відправлено', 'Пройдено'],
            ['2', 'Реєстрація з існуючим email', 'Помилка 400', 'Пройдено'],
            ['3', 'Вхід без верифікації', 'Помилка 403', 'Пройдено'],
            ['4', 'Вхід з невірним паролем', 'Помилка 401', 'Пройдено'],
            ['5', 'Каталог з фільтром', 'Товари за категорією', 'Пройдено'],
            ['6', 'Оформлення замовлення', 'Замовлення створено', 'Пройдено'],
            ['7', 'Промокод (валідний)', 'Знижка застосована', 'Пройдено'],
            ['8', 'Промокод (протермінований)', 'Помилка валідації', 'Пройдено'],
            ['9', 'Видалення товару (customer)', 'Помилка 403', 'Пройдено'],
            ['10', 'Відгук (некуплений товар)', 'Помилка 403', 'Пройдено'],
            ['11', 'Відгук (куплений товар)', 'Відгук створено', 'Пройдено'],
            ['12', 'Аналітика (admin)', 'Статистика', 'Пройдено'],
            ['13', 'Аналітика (customer)', 'Помилка 403', 'Пройдено'],
        ])

    add_body(doc,
        'Безпека: JWT-автентифікація працює коректно (невалідний/протермінований '
        'токен дає 401). Рольовий доступ дотримується. '
        'Паролі зберігаються у хеші bcrypt. '
        'LiqPay callback верифікує підпис.')

    add_body(doc,
        'Клієнтський інтерфейс тестувався вручну в Chrome. '
        'Перевірено маршрутизацію, збереження кошика, форми, адаптивність.')

    add_subsection_heading(doc, '3.4', 'Інструкція користувача')

    add_body(doc, 'Для запуску потрібен Docker і Docker Compose.')

    add_numbered_list(doc, [
        'скопіювати файли проекту;',
        'створити .env в директорії api/ (DATABASE_URL, JWT_SECRET, '
        'LIQPAY_PUBLIC_KEY, LIQPAY_PRIVATE_KEY, GEMINI_API_KEY, SMTP);',
        'виконати docker-compose up;',
        'клієнт: http://localhost:5182;',
        'адмін-панель: http://localhost:5183;',
        'API-документація: http://localhost:4000/docs.',
    ])

    add_body(doc,
        'Покупець: зареєструватися, підтвердити email, увійти. '
        'Далі: каталог, фільтри, пошук, кошик, промокод, '
        'оформлення замовлення.')

    add_body(doc,
        'Адміністратор: вхід через адмін-панель. '
        'Розділи: аналітика, товари, замовлення, '
        'користувачі, промокоди.')

    add_body(doc, 'На рисунках 3.2-3.8 показано основні екрани системи.')

    add_image(doc, '01_home.png', 'Рисунок 3.2. Головна сторінка')
    add_image(doc, '02_catalog.png', 'Рисунок 3.3. Каталог товарів')
    add_image(doc, '03_product.png', 'Рисунок 3.4. Сторінка товару')
    add_image(doc, '04_cart.png', 'Рисунок 3.5. Кошик')
    add_image(doc, '08_admin_analytics.png', 'Рисунок 3.6. Аналітика (адмін)')
    add_image(doc, '09_admin_products.png', 'Рисунок 3.7. Управління товарами')
    add_image(doc, '10_admin_orders.png', 'Рисунок 3.8. Управління замовленнями')

    add_subsection_heading(doc, '', 'Висновки до розділу 3')

    add_body(doc,
        'У третьому розділі описано реалізацію. Серверна частина: '
        'дев\'ять модулів, понад 30 ендпоінтів. Клієнт: дванадцять '
        'сторінок. Адмін: п\'ять розділів. Тестування за тринадцятьма '
        'сценаріями, всі пройдено.')

    add_page_break(doc)


def conclusions(doc):
    add_unnumbered_heading(doc, 'Висновки')

    add_body(doc,
        'У роботі розроблено веб-систему «TechBox» для підтримки '
        'продажів малого бізнесу з обліком товарів, замовлень '
        'і клієнтської бази. Архітектура триланкова: '
        'FastAPI + PostgreSQL (сервер), React + TypeScript (клієнт), '
        'окрема адмін-панель.')

    add_body(doc,
        'У першому розділі проаналізовано предметну область, '
        'порівняно п\'ять аналогічних систем, обрано стек технологій.')

    add_body(doc,
        'У другому спроектовано систему: UML-діаграми, '
        'чотирирівнева рольова модель, БД з шістьма таблицями, '
        'інтерфейс з дванадцятьма клієнтськими сторінками '
        'і п\'ятьма адмін-розділами.')

    add_body(doc,
        'У третьому реалізовано дев\'ять API-модулів з 30+ ендпоінтами, '
        'інтегровано LiqPay і Google Gemini. '
        'Тестування за тринадцятьма сценаріями пройдено.')

    add_body(doc,
        'Система готова до впровадження на підприємстві '
        'ФОП Раделицький В. В.')

    add_body(doc, 'Можливі напрямки розвитку:')

    add_dash_list(doc, [
        'мобільний додаток (React Native);',
        'інтеграція з іншими платіжними системами (Mono, PrivatBank);',
        'система рекомендацій на основі історії покупок;',
        'інтеграція з кур\'єрськими службами (Нова Пошта, Укрпошта);',
        'мультимовність (англійська, польська).',
    ])

    add_page_break(doc)


def references(doc):
    refs = [
        'ECommerce Ukraine. Аналітичний звіт e-commerce в Україні 2025. Київ, 2025. 48 с.',
        'Laudon K. C., Traver C. G. E-Commerce 2024. 17th ed. Pearson, 2024. 912 p.',
        'Rozetka. URL: https://rozetka.com.ua/ (дата звернення: 12.05.2026).',
        'Jabko. URL: https://jabko.ua/ (дата звернення: 12.05.2026).',
        'Shopify. URL: https://www.shopify.com/ (дата звернення: 10.05.2026).',
        'WooCommerce. URL: https://woocommerce.com/ (дата звернення: 10.05.2026).',
        'Django Software Foundation. Django Documentation. URL: https://docs.djangoproject.com/ (дата звернення: 06.05.2026).',
        'Pallets Projects. Flask Documentation. URL: https://flask.palletsprojects.com/ (дата звернення: 06.05.2026).',
        'Ramirez S. FastAPI Documentation. URL: https://fastapi.tiangolo.com/ (дата звернення: 05.05.2026).',
        'OpenJS Foundation. Express.js. URL: https://expressjs.com/ (дата звернення: 06.05.2026).',
        'NestJS. URL: https://docs.nestjs.com/ (дата звернення: 06.05.2026).',
        'Meta Open Source. React. URL: https://react.dev/ (дата звернення: 05.05.2026).',
        'The PostgreSQL Global Development Group. PostgreSQL 16. URL: https://www.postgresql.org/docs/16/ (дата звернення: 07.05.2026).',
        'Bayer M. SQLAlchemy. URL: https://docs.sqlalchemy.org/ (дата звернення: 09.05.2026).',
        'ISO/IEC 25010:2011. Systems and software Quality Requirements and Evaluation.',
        'Docker Inc. Docker Compose. URL: https://docs.docker.com/compose/ (дата звернення: 08.05.2026).',
        'Fielding R. T. Architectural Styles and the Design of Network-based Software Architectures. UC Irvine, 2000.',
        'Richardson L., Amundsen M. RESTful Web APIs. O\'Reilly, 2023. 408 p.',
        'Banks A., Porcello E. Learning React. 2nd ed. O\'Reilly, 2020. 310 p.',
        'TypeScript. URL: https://www.typescriptlang.org/docs/ (дата звернення: 07.05.2026).',
        'Evan You. Vite. URL: https://vite.dev/ (дата звернення: 06.05.2026).',
        'LiqPay. API Documentation. URL: https://www.liqpay.ua/documentation/ (дата звернення: 11.05.2026).',
        'Google. Gemini API. URL: https://ai.google.dev/docs (дата звернення: 10.05.2026).',
        'ДСТУ 3008:2015. Документація. Звіти у сфері науки і техніки. Київ: УкрНДНЦ, 2016.',
        'Закон України «Про електронну комерцію» від 03.09.2015 No 675-VIII.',
    ]
    add_references(doc, refs)


def appendices(doc):
    add_unnumbered_heading(doc, 'Додаток А. Фрагменти вихідного коду')

    add_body(doc, 'А.1. Моделі бази даних (api/app/models.py)')
    add_empty_paragraph(doc)

    code_text = '''import enum
from datetime import datetime
from sqlalchemy import (Boolean, Column, DateTime, Enum, ForeignKey,
                        Integer, JSON, Numeric, String, Text, func)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    manager = "manager"
    customer = "customer"

class OrderStatus(str, enum.Enum):
    new = "new"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    orders = relationship("Order", back_populates="user")
    reviews = relationship("ProductReview", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    old_price = Column(Numeric(10, 2), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    stock = Column(Integer, default=0)
    ai_description = Column(Text, nullable=True)
    ai_specs = Column(JSON, nullable=True)
    reviews = relationship("ProductReview", back_populates="product",
                          cascade="all, delete-orphan")'''

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.line_spacing = 1.0
    run = p.add_run(code_text)
    run.font.size = Pt(10)
    run.font.name = 'Consolas'

    add_page_break(doc)

    add_body(doc, 'А.2. Головний файл API (api/app/main.py)')
    add_empty_paragraph(doc)

    code_main = '''from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import (ai, analytics, auth, liqpay, orders,
                         products, promocodes, reviews, users)

app = FastAPI(title="TechBox API", version="1.0.0")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(liqpay.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(promocodes.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")'''

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p2.paragraph_format.first_line_indent = Cm(0)
    p2.paragraph_format.line_spacing = 1.0
    run2 = p2.add_run(code_main)
    run2.font.size = Pt(10)
    run2.font.name = 'Consolas'

    add_page_break(doc)

    add_body(doc, 'А.3. Docker Compose (docker-compose.yml)')
    add_empty_paragraph(doc)

    code_docker = '''services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: techbox
    ports: ["5433:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]

  api:
    build: ./api
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/techbox
    depends_on:
      db: {condition: service_healthy}

  client:
    build: ./client
    ports: ["5182:5182"]

  admin:
    build: ./admin
    ports: ["5183:5183"]

volumes:
  pgdata:'''

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p3.paragraph_format.first_line_indent = Cm(0)
    p3.paragraph_format.line_spacing = 1.0
    run3 = p3.add_run(code_docker)
    run3.font.size = Pt(10)
    run3.font.name = 'Consolas'


def main():
    doc = create_document()
    title_page(doc)
    assignment_page(doc)
    annotation(doc)
    abbreviations(doc)
    add_toc(doc)
    introduction(doc)
    section1(doc)
    section2(doc)
    section3(doc)
    conclusions(doc)
    references(doc)
    appendices(doc)
    doc.save(OUTPUT)
    print('Diploma report saved.')


if __name__ == '__main__':
    main()
