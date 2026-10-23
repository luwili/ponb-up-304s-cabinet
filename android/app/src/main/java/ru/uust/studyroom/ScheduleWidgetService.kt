package ru.uust.studyroom

import android.content.Context
import android.content.Intent
import android.view.View
import android.widget.RemoteViews
import android.widget.RemoteViewsService

class ScheduleWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        val isCompact = intent.getBooleanExtra("is_compact", false)
        return ScheduleRemoteViewsFactory(this.applicationContext, isCompact)
    }
}

class ScheduleRemoteViewsFactory(
    private val context: Context,
    private val isCompact: Boolean
) : RemoteViewsService.RemoteViewsFactory {
    private var pairs: List<PairItem> = emptyList()

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    private fun loadData() {
        val schedule = ScheduleRepository.getTodaySchedule(context)
        pairs = schedule.pairs
    }

    override fun onDestroy() {
        pairs = emptyList()
    }

    override fun getCount(): Int = pairs.size

    override fun getViewAt(position: Int): RemoteViews {
        if (position >= pairs.size) {
            val fallbackLayout = if (isCompact) R.layout.widget_pair_item_compact else R.layout.widget_pair_item
            return RemoteViews(context.packageName, fallbackLayout)
        }

        val item = pairs[position]

        if (isCompact) {
            val rv = RemoteViews(context.packageName, R.layout.widget_pair_item_compact)
            rv.setTextViewText(R.id.tv_pair_number, item.pairNumber.toString())
            rv.setTextViewText(R.id.tv_subject_name, item.subjectName)
            rv.setTextViewText(R.id.tv_room, if (item.room.isNotBlank()) item.room else "каб. 310")
            // Звонки (время пары) сохраняются наглядно
            rv.setTextViewText(R.id.tv_time, "${item.timeStart} – ${item.timeEnd}")

            if (item.isCurrent) {
                rv.setInt(R.id.item_root, "setBackgroundResource", R.drawable.bg_pair_item_current)
                rv.setViewVisibility(R.id.badge_now, View.VISIBLE)
            } else {
                rv.setInt(R.id.item_root, "setBackgroundResource", R.drawable.bg_pair_item)
                rv.setViewVisibility(R.id.badge_now, View.GONE)
            }

            val fillInIntent = Intent().apply {
                putExtra("subject_name", item.subjectName)
            }
            rv.setOnClickFillInIntent(R.id.item_root, fillInIntent)
            return rv
        } else {
            val rv = RemoteViews(context.packageName, R.layout.widget_pair_item)
            rv.setTextViewText(R.id.tv_pair_number, item.pairNumber.toString())
            rv.setTextViewText(R.id.tv_subject_name, item.subjectName)
            rv.setTextViewText(R.id.tv_teacher, if (item.teacher.isNotBlank()) item.teacher else "Институт права")
            rv.setTextViewText(R.id.tv_room, if (item.room.isNotBlank()) item.room else "ул. Достоевского, 131")
            rv.setTextViewText(R.id.tv_time, "${item.timeStart} – ${item.timeEnd}")
            rv.setTextViewText(R.id.tv_type, item.type)

            if (item.isCurrent) {
                rv.setInt(R.id.item_root, "setBackgroundResource", R.drawable.bg_pair_item_current)
                rv.setViewVisibility(R.id.badge_now, View.VISIBLE)
            } else {
                rv.setInt(R.id.item_root, "setBackgroundResource", R.drawable.bg_pair_item)
                rv.setViewVisibility(R.id.badge_now, View.GONE)
            }

            val fillInIntent = Intent().apply {
                putExtra("subject_name", item.subjectName)
            }
            rv.setOnClickFillInIntent(R.id.item_root, fillInIntent)
            return rv
        }
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 2
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = true
}
