"use client"
import PieChartComp from '@/components/charts/PieChartComp'
import SwiperAnnouncement from '@/components/home/SwiperAnnouncement'
import CardSchedule from '@/components/portal/CardSchedule'
import { cardColors } from '@/constants/cardColors'
import { useTheme } from '@/context/ThemeContext'
import React, {useState, useEffect} from 'react'

export default function DashboardSection({user}) {

    const {isDarkMode} = useTheme()

    const [instructor, setInstructor] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [todaySchedules, setTodaySchedules] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instructorRes = await fetch("/api/instructors", {
          method: "GET",
        });

        if (!instructorRes.ok) {
          throw new Error('Network response was not ok');
        }

        const instructorData = await instructorRes.json();
        const foundStudent = instructorData.data.instructors.find(item => item.instructorNo === user.instructorNo);
        setInstructor(foundStudent);

        const scheduleRes = await fetch("/api/schedules", {
          method: "GET",
        });

        if (!scheduleRes.ok) {
          throw new Error('Network response was not ok');
        }

        const scheduleData = await scheduleRes.json();
        setSchedules(scheduleData.data.schedules);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };


    fetchData();
    
  }, [user]);

  useEffect(() => {
    if (schedules.length > 0 && instructor) {
      const mySchedules = schedules.filter(schedule => 
        (instructor.firstname + " " + instructor.lastname) === schedule.instructor_name
      );

      const today = getCurrentDay();
      const todayClasses = mySchedules.filter(schedule => 
        schedule.class_day.includes(today)
      );

      setTodaySchedules(todayClasses);

    }
  }, [schedules, instructor]);

  function getCurrentDay() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date();
    const dayIndex = date.getDay();
    return days[dayIndex];
  }

  return (
    <div className={`h-full w-full flex flex-col justify-center items-center gap-4 p-6 ${isDarkMode ? `bg-[#121212] text-white` : `bg-[#f1f1f1] text-black`}`}>
      <div className='w-full grid grid-cols-5 gap-4 h-full'>
        <div className={`col-span-3 ${isDarkMode ? `bg-[#282828]` : 'bg-white'} shadow-md rounded-lg flex flex-col items-center justify-start p-3 w-full h-full`}>
          <h2 className={`border-b-2 ${isDarkMode ? 'border-[#FFE714]' : `border-[#044721]`}  mb-8`}>Announcements</h2>
          <SwiperAnnouncement />
        </div>

        <div className={`col-span-2 ${isDarkMode ? `bg-[#282828]` : 'bg-white'} shadow-md rounded-lg flex flex-col items-center justify-start p-3 w-full h-full`}>
          <h2 className={`border-b-2 ${isDarkMode ? 'border-[#FFE714]' : `border-[#044721]`}  mb-8`}>Request</h2>

        </div>
      </div>

      <div className='w-full grid grid-cols-5 gap-4 h-full'>
        <div className={`col-span-3 ${isDarkMode ? `bg-[#282828]` : 'bg-white'} shadow-md rounded-lg flex flex-col items-center gap-4 p-3`}>
          <h2 className={`border-b-2 ${isDarkMode ? ` border-[#FFE714]` : `border-[#044721]`} inline-block`}>Handle Courses</h2>

          <table className='flex flex-col w-full shadow-md rounded-md'>
            <thead className='w-full'>
              <tr className={`flex justify-between items-center bg-opacity-25 p-2 ${isDarkMode ? `text-[#FFE714] bg-[#FFE714]` : `text-[#044721] bg-[#044721]`} rounded-t-md`}>
                <th className='data items-center'>Course Code</th>
                <th className='data items-center'>Course Name</th>
                <th className='data items-center'>Credits</th>
                <th className='data items-center'>Sections</th>
              </tr>
            </thead>
            <tbody className='w-full overflow-y-auto hide-scrollbar' style={{ maxHeight: '385px' }}>
              {instructor?.handle_courses?.length > 0 ? (
                instructor.handle_courses.map((course, index) => (
                  <tr key={index} className='row'>
                    <td className='data p-1 items-center'>{course.course_code}</td>
                    <td className='data p-1 items-center'>{course.course_name}</td>
                    <td className='data p-1 items-center'>{course.credits}</td>
                    <td className='data p-1 items-center'>{course.sections.join(', ')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className='data p-1 text-center'>No courses handled</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={`col-span-2 ${isDarkMode ? `bg-[#282828]` : 'bg-white'} shadow-md rounded-lg flex flex-col items-center gap-4 p-3`}>
          <h2 className={`border-b-2 ${isDarkMode ? `border-[#FFE714]` : `border-[#044721]`} inline-block`}>Today Schedule</h2>
          <div className='flex flex-col gap-3 items-center w-full overflow-y-auto hide-scrollbar' style={{ maxHeight: '450px' }}>
            {todaySchedules.length > 0 ? (
              todaySchedules.map((schedule, index) => (
                <CardSchedule 
                  key={schedule.id}
                  color={cardColors[index % cardColors.length]}
                  course_name={schedule.course_name}
                  course_code={schedule.course_code}
                  building_name={schedule.building_name}
                  room_no={schedule.room_no}
                  section={schedule.section}
                  instructor_name={schedule.instructor_name}
                  class_day={schedule.class_day}
                  start_time={schedule.time.start_time}
                  end_time={schedule.time.end_time}
                />
              ))
            ) : (
              <p className='text-center'>No classes today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
