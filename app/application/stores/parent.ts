import { defineStore } from 'pinia';
import { ref } from 'vue';
import { parentRepository } from '../../infrastructure/api/ParentRepository';

export const useParentStore = defineStore('parent', () => {
  const children = ref<any[]>([]);
  const loadingChildren = ref(false);

  const wallet = ref<any>(null);
  const loadingWallet = ref(false);

  const childAttendance = ref<any[]>([]);
  const loadingAttendance = ref(false);

  const childGrades = ref<any[]>([]);
  const loadingGrades = ref(false);

  async function fetchChildren() {
    loadingChildren.value = true;
    try {
      const res: any = await parentRepository.getMyChildren();
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
      const res: any = await parentRepository.getChildWallet(studentId);
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
      const res: any = await parentRepository.getChildAttendance(studentId);
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
      const res: any = await parentRepository.getChildGrades(studentId);
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

  const announcements = ref<any[]>([]);
  const loadingAnnouncements = ref(false);

  const childSchedule = ref<any[]>([]);
  const loadingSchedule = ref(false);

  const leaveRequests = ref<any[]>([]);
  const loadingLeaveRequests = ref(false);

  const spendingLimits = ref<any>(null);
  const loadingSpendingLimits = ref(false);

  async function fetchAnnouncements() {
    loadingAnnouncements.value = true;
    try {
      const res: any = await parentRepository.getAnnouncements();
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
      const res: any = await parentRepository.getChildSchedule(studentId);
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
      const res: any = await parentRepository.getLeaveRequests(studentId);
      leaveRequests.value = res.data || [];
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
      throw error;
    } finally {
      loadingLeaveRequests.value = false;
    }
  }

  async function createLeaveRequest(studentId: number, data: any) {
    return parentRepository.createLeaveRequest(studentId, data);
  }

  async function fetchSpendingLimits(studentId: number) {
    loadingSpendingLimits.value = true;
    try {
      const res: any = await parentRepository.getSpendingLimits(studentId);
      spendingLimits.value = res.data;
    } catch (error) {
      console.error('Failed to fetch spending limits', error);
      throw error;
    } finally {
      loadingSpendingLimits.value = false;
    }
  }

  async function updateSpendingLimits(studentId: number, data: any) {
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
