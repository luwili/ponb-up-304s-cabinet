package ru.uust.studyroom

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ScheduleWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_REFRESH = "ru.uust.studyroom.ACTION_REFRESH"
        private const val WEB_CABINET_URL = "https://luwili.github.io/study_room/#/schedule"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule)
            val schedule = ScheduleRepository.getTodaySchedule(context)

            // Header labels
            views.setTextViewText(R.id.tv_week_badge, "Неделя ${schedule.weekNumber}")
            val headerDate = if (schedule.isToday) {
                "${TimeUtils.getFormattedHeaderDate()} (${schedule.dayName})"
            } else {
                "Завтра: ${schedule.dayName}, ${schedule.date}"
            }
            views.setTextViewText(R.id.tv_header_date, headerDate)

            // Set up RemoteViewsService for ListView
            val serviceIntent = Intent(context, ScheduleWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
            }
            views.setRemoteAdapter(R.id.list_pairs, serviceIntent)
            views.setEmptyView(R.id.list_pairs, R.id.layout_empty)

            // Empty state visibility
            if (schedule.pairs.isEmpty()) {
                views.setViewVisibility(R.id.layout_empty, View.VISIBLE)
                views.setViewVisibility(R.id.list_pairs, View.GONE)
            } else {
                views.setViewVisibility(R.id.layout_empty, View.GONE)
                views.setViewVisibility(R.id.list_pairs, View.VISIBLE)
            }

            // Refresh action PendingIntent
            val refreshIntent = Intent(context, ScheduleWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_refresh, refreshPendingIntent)

            // Open website action PendingIntent
            val openWebIntent = Intent(Intent.ACTION_VIEW, Uri.parse(WEB_CABINET_URL)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            val openWebPendingIntent = PendingIntent.getActivity(
                context,
                1,
                openWebIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_open_web, openWebPendingIntent)

            // Click on list item opens web schedule
            val listClickPendingIntent = PendingIntent.getActivity(
                context,
                2,
                openWebIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setPendingIntentTemplate(R.id.list_pairs, listClickPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.list_pairs)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, ScheduleWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (widgetId in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, widgetId)
            }
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }

        // Background sync check
        CoroutineScope(Dispatchers.IO).launch {
            val updated = ScheduleRepository.fetchAndCache(context)
            if (updated) {
                CoroutineScope(Dispatchers.Main).launch {
                    updateAllWidgets(context)
                }
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            CoroutineScope(Dispatchers.IO).launch {
                ScheduleRepository.fetchAndCache(context)
                CoroutineScope(Dispatchers.Main).launch {
                    updateAllWidgets(context)
                }
            }
        }
    }
}
