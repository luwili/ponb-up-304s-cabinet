import {test,expect} from '@playwright/test';
for(const width of [360,768,1440])test(`Все разделы без переполнений, ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  for(const route of ['/','/subjects','/schedule','/assignments','/exams','/teachers','/departments','/group','/institute','/favorites','/help','/materials/test-full','/not-found']) {
    await page.goto('/cabinet/#'+route);await expect(page.locator('main')).not.toContainText('Открываем учебный кабинет');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
  }
  expect(errors).toEqual([]);await page.goto('/empty/#/');await expect(page.getByRole('heading',{name:'С возвращением!'})).toBeVisible();
  if(width===1440||width===360)await page.screenshot({path:`/tmp/opencode/cabinet-${width}.png`,fullPage:true});
});
test('Прямое открытие, переключение конспектов, Markdown безопасен, избранное после перезагрузки',async({page})=>{
  await page.goto('/cabinet/#/materials/test-full');await expect(page.locator('.reading-content')).toContainText('Учёба и повторение');
  expect(await page.evaluate(()=>Boolean((window as unknown as {unsafeExecuted?:boolean}).unsafeExecuted))).toBe(false);
  await expect(page.locator('.reading-content script,.reading-content img[onerror],.reading-content a[href^="javascript:"]')).toHaveCount(0);
  await page.getByRole('button',{name:'В избранное',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'В избранном',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Краткий для записи',exact:true}).click();await expect(page.locator('.reading-content')).toContainText('Краткая запись для теста');
  await page.goto('/cabinet/#/favorites');await expect(page.locator('main')).toContainText('Полный тестовый конспект');
  await page.goto('/cabinet/#/materials/test-task');await expect(page.getByText('Тестовое решение.',{exact:true})).not.toBeVisible();
  await page.getByRole('button',{name:'Показать решение'}).click();await expect(page.getByText('Тестовое решение.',{exact:true})).toBeVisible();
});
test('Поиск е/ё, сочетание фильтров, учитель, кафедра и личные отметки',async({page})=>{
  await page.goto('/cabinet/#/search?q=УЧЕБА');await expect(page.locator('main')).toContainText('Полный тестовый конспект');
  await page.getByRole('combobox',{name:'Предмет',exact:true}).selectOption('test-law');await page.getByRole('combobox',{name:'Тип',exact:true}).selectOption('Конспект');await expect(page.locator('main')).toContainText('Полный тестовый конспект');
  await page.goto('/cabinet/#/teachers');await page.getByRole('textbox',{name:'Поиск по ФИО',exact:true}).fill('Кострова');await expect(page.locator('.teacher-card')).toHaveCount(1);await page.getByRole('combobox',{name:'Кафедра',exact:true}).selectOption('ugolovnoe');await expect(page.locator('.teacher-card')).toHaveCount(1);await page.locator('.teacher-card').click();await expect(page.locator('dd')).toContainText(['Кафедра уголовного права и процесса','Профессор','кандидат юридических наук','доцент']);
  await page.goto('/cabinet/#/assignments');await page.getByRole('combobox',{name:'Срок',exact:true}).selectOption('none');await page.getByRole('button',{name:'Отметить выполненным'}).click();await page.reload();await page.getByRole('combobox',{name:'Срок',exact:true}).selectOption('none');await expect(page.getByRole('button',{name:'Выполнено',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.goto('/cabinet/#/exams');await page.getByRole('button',{name:'Карточки',exact:true}).click();await page.getByRole('button',{name:'Показать ответ'}).click();await expect(page.locator('.flashcard')).toContainText('Явно подготовленный тестовый ответ.');await page.getByRole('button',{name:'Знаю',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Знаю',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('Скачивание, картинка, пустая группа, тёмная тема и мобильное меню',async({page})=>{
  await page.setViewportSize({width:360,height:800});await page.goto('/cabinet/#/subjects/test-law');
  await page.getByRole('link',{name:'Приложение',exact:false}).click();const download=page.waitForEvent('download');await page.getByRole('link',{name:'Скачать оригинал',exact:false}).click();const file=await download;expect(file.suggestedFilename()).toMatch(/\.pdf$/);
  await page.goto('/cabinet/#/subjects/test-law');await page.getByRole('link',{name:'Изображение',exact:false}).click();await expect(page.locator('.image-viewer img')).toBeVisible();
  await page.goto('/cabinet/#/group');await expect(page.locator('main')).toContainText('Список группы будет добавлен позже');
  await page.getByRole('button',{name:'Включить тёмную тему'}).click();await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'Открыть меню',exact:true}).click();await expect(page.locator('.sidebar')).toHaveClass(/is-open/);await page.getByRole('link',{name:'Кафедры',exact:true}).click();await expect(page.getByRole('heading',{name:'Кафедры',exact:true})).toBeVisible();await expect(page.locator('.sidebar')).not.toHaveClass(/is-open/);
});
test('Повреждённое и недоступное хранилище',async({browser})=>{
  const context=await browser.newContext({timezoneId:'America/Los_Angeles'});const page=await context.newPage();
  await page.addInitScript(()=>{localStorage.setItem('cabinet-favorites','broken json');localStorage.setItem('cabinet-theme','42');});
  await page.goto('/cabinet/#/');await expect(page.getByRole('heading',{name:'С возвращением!'})).toBeVisible();
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});
  await page.reload();await expect(page.locator('[role="status"]')).toContainText('Хранилище браузера недоступно');await context.close();
});
