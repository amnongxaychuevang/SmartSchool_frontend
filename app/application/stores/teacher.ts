import { defineStore } from 'pinia';
import { ref } from 'vue';
import { teacherRepository } from '../../infrastructure/api/TeacherRepository';

export const useTeacherStore = defineStore('teacher', () => {
  const myClasses = ref<any[]>([]);
  const loadingClasses = ref(false);

  const myStudents = ref<any[]>([]);
  const loadingStudents = ref(false);

  async function fetchMyClasses() {
    loadingClasses.value = true;
    try {
      const res: any = await teacherRepository.getMyClasses();
      myClasses.value = res.data?.classes || [];
    } catch (error) {
      console.error('Failed to fetch teacher classes', error);
      throw error;
    } finally {
      loadingClasses.value = false;
    }
  }

  async function fetchMyStudents(classId: number) {
    loadingStudents.value = true;
    try {
      const res: any = await teacherRepository.getMyStudents(classId);
      myStudents.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch students', error);
      throw error;
    } finally {
      loadingStudents.value = false;
    }
  }

  async function saveAttendance(records: any[]) {
    await teacherRepository.saveAttendance(records);
  }

  async function saveGrades(records: any[]) {
    await teacherRepository.saveGrades(records);
  }

  const mySchedules = ref<any[]>([]);
  const loadingSchedules = ref(false);

  const announcements = ref<any[]>([]);
  const loadingAnnouncements = ref(false);

  const leaveRequests = ref<any[]>([]);
  const loadingLeaveRequests = ref(false);

  async function fetchSchedules() {
    loadingSchedules.value = true;
    try {
      const res: any = await teacherRepository.getSchedules();
      mySchedules.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch schedules', error);
    } finally {
      loadingSchedules.value = false;
    }
  }

  async function fetchAnnouncements() {
    loadingAnnouncements.value = true;
    try {
      const res: any = await teacherRepository.getAnnouncements();
      announcements.value = res.data?.data || res.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements', error);
    } finally {
      loadingAnnouncements.value = false;
    }
  }

  async function fetchLeaveRequests() {
    loadingLeaveRequests.value = true;
    try {
      const res: any = await teacherRepository.getLeaveRequests();
      leaveRequests.value = res.data?.requests || [];
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
    } finally {
      loadingLeaveRequests.value = false;
    }
  }

  async function updateLeaveRequestStatus(leaveId: number, status: 'approved' | 'rejected') {
    await teacherRepository.updateLeaveRequestStatus(leaveId, status);
    await fetchLeaveRequests();
  }

  return {
    myClasses,
    loadingClasses,
    fetchMyClasses,
    myStudents,
    loadingStudents,
    fetchMyStudents,
    saveAttendance,
    saveGrades,
    mySchedules,
    loadingSchedules,
    fetchSchedules,
    announcements,
    loadingAnnouncements,
    fetchAnnouncements,
    leaveRequests,
    loadingLeaveRequests,
    fetchLeaveRequests,
    updateLeaveRequestStatus
  };
});
