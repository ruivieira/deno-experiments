/**
 * INFO: Stubs for SCF Vue.js apps
 */

export interface VueApp<T> {
  el: string;
  created(): void;
  methods: { [f: string]: (args?: any) => void };
  data: T;
  computed: { [f: string]: () => any };
}
