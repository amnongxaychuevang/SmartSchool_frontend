import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from './StatCard.vue';

describe('StatCard', () => {
  it('renders the title and value', () => {
    const wrapper = mount(StatCard, {
      props: { title: 'Total Students', value: 128 },
    });

    expect(wrapper.text()).toContain('Total Students');
    expect(wrapper.text()).toContain('128');
  });

  it('applies the default color class when none is given', () => {
    const wrapper = mount(StatCard, { props: { title: 'X', value: 1 } });
    expect(wrapper.find('.w-12').classes()).toContain('bg-teal-500');
  });

  it('applies a custom color class when given one', () => {
    const wrapper = mount(StatCard, { props: { title: 'X', value: 1, colorClass: 'bg-red-500' } });
    expect(wrapper.find('.w-12').classes()).toContain('bg-red-500');
  });

  it('renders a custom icon slot instead of the default icon', () => {
    const wrapper = mount(StatCard, {
      props: { title: 'X', value: 1 },
      slots: { icon: '<span class="custom-icon">★</span>' },
    });
    expect(wrapper.find('.custom-icon').exists()).toBe(true);
    expect(wrapper.find('svg').exists()).toBe(false);
  });
});
