import { defineStore } from 'pinia';
import { ref } from 'vue';
import { parentRepository } from '../../infrastructure/api/ParentRepository';
import type { ScheduleSlot } from '../../infrastructure/api/AcademicsRepository';
import type { Student } from '../../domain/models/Student';
import type { Grade } from '../../domain/models/Academics';
import type { Wallet, SpendingLimit } from '../../domain/models/Finance';
import type { Announcement, DailyAttendance, LeaveRequest } from '../../domain/models/School';

export const useParentStore = defineStore('parent', () => {
  const children = ref<Student[]>([]);
  const loadingChildren = ref(false);

  const wallet = ref<Wallet | null>(null);
  const loadingWallet = ref(false);

  const childAttendance = ref<DailyAttendance[]>([]);
  const loadingAttendance = ref(false);

  const childGrades = ref<Grade[]>([]);
  const loadingGrades = ref(false);

  async function fetchChildren() {
    loadingChildren.value = true;
    try {
      const res = await parentRepository.getMyChildren();
      children.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch children', error);
      throw error;
    } finally {
      loadingChildren.value = false;
    }
  }

  async function fetchChildWallet(studentId: number) {
    loadingWallet.value = true;
    try {
      const res = await parentRepository.getChildWallet(studentId);
      wallet.value = res.data;
    } catch (error) {
      console.error('Failed to fetch child wallet', error);
      throw error;
    } finally {
      loadingWallet.value = false;
    }
  }

  async function fetchChildAttendance(studentId: number) {
    loadingAttendance.value = true;
    try {
      const res = await parentRepository.getChildAttendance(studentId);
      childAttendance.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch child attendance', error);
      throw error;
    } finally {
      loadingAttendance.value = false;
    }
  }

  async function fetchChildGrades(studentId: number) {
    loadingGrades.value = true;
    try {
      const res = await parentRepository.getChildGrades(studentId);
      childGrades.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch child grades', error);
      throw error;
    } finally {
      loadingGrades.value = false;
    }
  }

  async function requestTopUp(amount: number, proofOfPayment: string) {
    return parentRepository.requestTopUp({ amount, proofOfPayment });
  }

  const announcements = ref<Announcement[]>([]);
  const loadingAnnouncements = ref(false);

  const childSchedule = ref<ScheduleSlot[]>([]);
  const loadingSchedule = ref(false);

  const leaveRequests = ref<LeaveRequest[]>([]);
  const loadingLeaveRequests = ref(false);

  const spendingLimits = ref<SpendingLimit | null>(null);
  const loadingSpendingLimits = ref(false);

  async function fetchAnnouncements() {
    loadingAnnouncements.value = true;
    try {
      const res = await parentRepository.getAnnouncements();
      announcements.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch announcements', error);
      throw error;
    } finally {
      loadingAnnouncements.value = false;
    }
  }

  async function fetchChildSchedule(studentId: number) {
    loadingSchedule.value = true;
    try {
      const res = await parentRepository.getChildSchedule(studentId);
      childSchedule.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch schedule', error);
      throw error;
    } finally {
      loadingSchedule.value = false;
    }
  }

  async function fetchLeaveRequests(studentId: number) {
    loadingLeaveRequests.value = true;
    try {
      const res = await parentRepository.getLeaveRequests(studentId);
      leaveRequests.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
      throw error;
    } finally {
      loadingLeaveRequests.value = false;
    }
  }

  async function createLeaveRequest(studentId: number, data: Parameters<typeof parentRepository.createLeaveRequest>[1]) {
    return parentRepository.createLeaveRequest(studentId, data);
  }

  async function fetchSpendingLimits(studentId: number) {
    loadingSpendingLimits.value = true;
    try {
      const res = await parentRepository.getSpendingLimits(studentId);
      spendingLimits.value = res.data;
    } catch (error) {
      console.error('Failed to fetch spending limits', error);
      throw error;
    } finally {
      loadingSpendingLimits.value = false;
    }
  }

  async function updateSpendingLimits(studentId: number, data: Parameters<typeof parentRepository.updateSpendingLimits>[1]) {
    return parentRepository.updateSpendingLimits(studentId, data);
  }

  return {
    children,
    loadingChildren,
    fetchChildren,
    wallet,
    loadingWallet,
    fetchChildWallet,
    childAttendance,
    loadingAttendance,
    fetchChildAttendance,
    childGrades,
    loadingGrades,
    fetchChildGrades,
    requestTopUp,
    announcements,
    loadingAnnouncements,
    fetchAnnouncements,
    childSchedule,
    loadingSchedule,
    fetchChildSchedule,
    leaveRequests,
    loadingLeaveRequests,
    fetchLeaveRequests,
    createLeaveRequest,
    spendingLimits,
    loadingSpendingLimits,
    fetchSpendingLimits,
    updateSpendingLimits
  };
});
