package ru.uust.studyroom

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.SizeF
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
            val schedule = ScheduleRepository.getTodaySchedule(context)

            val remoteViews = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ Responsive Layouts
                val compactView = buildCompactViews(context, appWidgetId, schedule)
                val expandedView = buildExpandedViews(context, appWidgetId, schedule)
                val viewMapping = mapOf(
                    SizeF(120f, 60f) to compactView,
                    SizeF(240f, 150f) to expandedView
                )
                RemoteViews(viewMapping)
            } else {
                // Android < 12 size detection
                val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
                val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 280)
                val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 180)
                if (height < 140 || width < 230) {
                    buildCompactViews(context, appWidgetId, schedule)
                } else {
                    buildExpandedViews(context, appWidgetId, schedule)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, remoteViews)
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.list_pairs)
        }

        private fun buildCompactViews(
            context: Context,
            appWidgetId: Int,
            schedule: DaySchedule
        ): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule_compact)

            views.setTextViewText(R.id.tv_week_badge, "Нед. ${schedule.weekNumber}")
            val headerDate = if (schedule.isToday) {
                schedule.dayName
            } else {
                "Завтра (${schedule.dayName})"
            }
            views.setTextViewText(R.id.tv_header_date, headerDate)

            // Adapter Intent with is_compact=true
            val serviceIntent = Intent(context, ScheduleWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                putExtra("is_compact", true)
                data = Uri.parse("ru.uust.studyroom://widget/$appWidgetId/compact")
            }
            views.setRemoteAdapter(R.id.list_pairs, serviceIntent)
            views.setEmptyView(R.id.list_pairs, R.id.layout_empty)

            if (schedule.pairs.isEmpty()) {
                views.setViewVisibility(R.id.layout_empty, View.VISIBLE)
                views.setViewVisibility(R.id.list_pairs, View.GONE)
            } else {
                views.setViewVisibility(R.id.layout_empty, View.GONE)
                views.setViewVisibility(R.id.list_pairs, View.VISIBLE)
            }

            // Refresh action
            val refreshPendingIntent = createRefreshPendingIntent(context)
            views.setOnClickPendingIntent(R.id.btn_refresh, refreshPendingIntent)

            // Click on list item opens web schedule
            val listClickPendingIntent = createOpenWebPendingIntent(context)
            views.setPendingIntentTemplate(R.id.list_pairs, listClickPendingIntent)

            return views
        }

        private fun buildExpandedViews(
            context: Context,
            appWidgetId: Int,
            schedule: DaySchedule
        ): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule)

            views.setTextViewText(R.id.tv_week_badge, "Неделя ${schedule.weekNumber}")
            val headerDate = if (schedule.isToday) {
                "${TimeUtils.getFormattedHeaderDate()} (${schedule.dayName})"
            } else {
                "Завтра: ${schedule.dayName}, ${schedule.date}"
            }
            views.setTextViewText(R.id.tv_header_date, headerDate)

            // Adapter Intent with is_compact=false
            val serviceIntent = Intent(context, ScheduleWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                putExtra("is_compact", false)
                data = Uri.parse("ru.uust.studyroom://widget/$appWidgetId/expanded")
            }
            views.setRemoteAdapter(R.id.list_pairs, serviceIntent)
            views.setEmptyView(R.id.list_pairs, R.id.layout_empty)

            if (schedule.pairs.isEmpty()) {
                views.setViewVisibility(R.id.layout_empty, View.VISIBLE)
                views.setViewVisibility(R.id.list_pairs, View.GONE)
            } else {
                views.setViewVisibility(R.id.layout_empty, View.GONE)
                views.setViewVisibility(R.id.list_pairs, View.VISIBLE)
            }

            // Refresh action
            val refreshPendingIntent = createRefreshPendingIntent(context)
            views.setOnClickPendingIntent(R.id.btn_refresh, refreshPendingIntent)

            // Open website action
            val openWebPendingIntent = createOpenWebPendingIntent(context)
            views.setOnClickPendingIntent(R.id.btn_open_web, openWebPendingIntent)

            // Click on list item opens web schedule
            views.setPendingIntentTemplate(R.id.list_pairs, openWebPendingIntent)

            return views
        }

        private fun createRefreshPendingIntent(context: Context): PendingIntent {
            val refreshIntent = Intent(context, ScheduleWidgetProvider::class.java).apply {
                action = ACTION_REFRESH
            }
            return PendingIntent.getBroadcast(
                context,
                0,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        private fun createOpenWebPendingIntent(context: Context): PendingIntent {
            val openWebIntent = Intent(Intent.ACTION_VIEW, Uri.parse(WEB_CABINET_URL)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            return PendingIntent.getActivity(
                context,
                1,
                openWebIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
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

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: Bundle
    ) {
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions)
        updateAppWidget(context, appWidgetManager, appWidgetId)
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
