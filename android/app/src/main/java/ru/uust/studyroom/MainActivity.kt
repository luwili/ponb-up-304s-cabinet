package ru.uust.studyroom

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private val cabinetUrl = "https://luwili.github.io/study_room/"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvStatus = findViewById<TextView>(R.id.tv_cache_status)
        val btnUpdate = findViewById<Button>(R.id.btn_update_now)
        val btnOpenWeb = findViewById<Button>(R.id.btn_open_website)

        // Initial check
        refreshData(tvStatus)

        btnUpdate.setOnClickListener {
            tvStatus.text = "Статус: синхронизация с сервером..."
            refreshData(tvStatus, showToast = true)
        }

        btnOpenWeb.setOnClickListener {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(cabinetUrl))
            startActivity(intent)
        }
    }

    private fun refreshData(tvStatus: TextView, showToast: Boolean = false) {
        CoroutineScope(Dispatchers.IO).launch {
            val success = ScheduleRepository.fetchAndCache(this@MainActivity)
            val schedule = ScheduleRepository.getTodaySchedule(this@MainActivity)
            withContext(Dispatchers.Main) {
                if (success) {
                    tvStatus.text = "Статус: данные актуальны (пар сегодня: ${schedule.pairs.size}, неделя ${schedule.weekNumber})"
                    if (showToast) Toast.makeText(this@MainActivity, "Расписание успешно обновлено!", Toast.LENGTH_SHORT).show()
                } else {
                    tvStatus.text = "Статус: используется локальный кэш (пар сегодня: ${schedule.pairs.size}, неделя ${schedule.weekNumber})"
                    if (showToast) Toast.makeText(this@MainActivity, "Данные загружены из кэша", Toast.LENGTH_SHORT).show()
                }
                ScheduleWidgetProvider.updateAllWidgets(this@MainActivity)
            }
        }
    }
}
