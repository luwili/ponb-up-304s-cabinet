/**
 * Модуль для запроса обновления расписания из ИСУ УУНиТ
 * через GitHub Actions (workflow_dispatch) или локальный dev-сервер.
 */

export const REPO_OWNER = 'luwili';
export const REPO_NAME = 'ponb-up-304s-cabinet';
export const WORKFLOW_ID = 'deploy.yml';
export const GITHUB_TOKEN_KEY = 'ponb_github_sync_token';

export function getSavedGithubToken(): string {
  try {
    return localStorage.getItem(GITHUB_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGithubToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(GITHUB_TOKEN_KEY);
    }
  } catch {}
}

export async function requestScheduleUpdate(
  token: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; message?: string }> {
  // 1. Если сайт запущен локально (npm run dev), вызываем локальный API эндпоинт
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    try {
      onProgress?.('Запуск локального скрипта python3 scripts/sync_uust_schedule.py...');
      const res = await fetch('/api/sync-schedule', { method: 'POST' });
      if (res.ok) {
        onProgress?.('Расписание успешно обновлено из ИСУ УУНиТ! Перезагрузка страницы...');
        setTimeout(() => window.location.reload(), 1200);
        return { success: true };
      }
    } catch {
      // Иначе пробуем GitHub API
    }
  }

  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Токен GitHub не указан. Введите персональный токен GitHub (PAT).');
  }

  onProgress?.('Отправка запроса на запуск скрипта в GitHub Actions...');

  const dispatchRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_ID}/dispatches`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );

  if (!dispatchRes.ok) {
    if (dispatchRes.status === 401 || dispatchRes.status === 403) {
      throw new Error('Неверный токен GitHub или недостаточно прав (требуется разрешение "Actions" или "workflow").');
    }
    const errText = await dispatchRes.text();
    throw new Error(`Ошибка вызова GitHub Actions (${dispatchRes.status}): ${errText}`);
  }

  saveGithubToken(cleanToken);
  onProgress?.('Скрипт запущен на сервере GitHub. Ожидание выполнения...');

  // Пауза перед первым опросом
  await new Promise((r) => setTimeout(r, 3000));

  const startTime = Date.now();
  const timeoutMs = 120000; // 2 минуты
  let targetRunId: number | null = null;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const runsRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=3`,
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${cleanToken}`,
          },
        }
      );

      if (runsRes.ok) {
        const data = await runsRes.json();
        const runs = data.workflow_runs || [];

        if (!targetRunId && runs.length > 0) {
          const recentRun = runs.find((r: any) => {
            const runCreated = new Date(r.created_at).getTime();
            return Math.abs(Date.now() - runCreated) < 60000;
          });
          if (recentRun) {
            targetRunId = recentRun.id;
          }
        }

        if (targetRunId) {
          const run = runs.find((r: any) => r.id === targetRunId);
          if (run) {
            if (run.status === 'completed') {
              if (run.conclusion === 'success') {
                onProgress?.('✅ Расписание синхронизировано с сервером ИСУ УУНиТ! Обновляем страницу...');
                setTimeout(() => window.location.reload(), 1500);
                return { success: true };
              } else {
                throw new Error(`Скрипт завершился с ошибкой: ${run.conclusion}`);
              }
            } else {
              onProgress?.(
                `Выполнение скрипта в GitHub: ${run.status === 'in_progress' ? 'сборка и синхронизация' : run.status}...`
              );
            }
          }
        } else {
          onProgress?.('Регистрация задачи в GitHub Actions...');
        }
      }
    } catch (e: any) {
      console.warn('Poll error:', e);
    }

    await new Promise((r) => setTimeout(r, 4000));
  }

  // Если тайм-аут ожидания вебхука, перезагружаем страницу
  onProgress?.('Завершение задачи. Обновление страницы...');
  setTimeout(() => window.location.reload(), 2000);
  return { success: true };
}
