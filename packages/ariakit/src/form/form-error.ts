import { useCallback, useRef } from "react";
import { useStore, createMemoComponent } from "ariakit-utils/store";
import { createHook, createElement } from "ariakit-utils/system";
import { useForkRef, useId } from "ariakit-utils/hooks";
import { As, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { FormState } from "./form-state";
import { FormContext, StringLike } from "./__utils";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that displays an error message. The
 * `children` will be automatically set to the error message set on the state.
 * @see https://ariakit.org/docs/form
 * @example
 * ```jsx
 * const state = useFormState({ defaultValues: { email: "" } });
 * const props = useFormError({ state, name: state.names.email });
 *
 * state.useValidate(() => {
 *   if (!state.values.email) {
 *     state.setError(state.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form state={state}>
 *   <FormLabel name={state.names.email}>Email</FormLabel>
 *   <FormInput name={state.names.email} />
 *   <Role {...props} />
 * </Form>
 * ```
 */
export const useFormError = createHook<FormErrorOptions>(
  ({ state, name: nameProp, ...props }) => {
    const name = `${nameProp}`;
    state = useStore(state || FormContext, [
      useCallback((s: FormState) => s.getError(name), [name]),
      useCallback((s: FormState) => s.getFieldTouched(name), [name]),
    ]);

    const ref = useRef<HTMLInputElement>(null);

    const id = useId(props.id);

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, name, type: "error" };
        if (props.getItem) {
          return props.getItem(nextItem);
        }
        return nextItem;
      },
      [id, name, props.getItem]
    );

    const shouldShowError =
      state?.getError(name) != null && state.getFieldTouched(name);
    const children = shouldShowError ? state?.getError(name) : undefined;

    props = {
      id,
      role: "alert",
      children,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useCollectionItem({ state, ...props, getItem });

    return props;
  }
);

/**
 * A component that renders an element that displays an error message. The
 * `children` will be automatically set to the error message set on the state.
 * @see https://ariakit.org/docs/form
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { email: "" } });
 *
 * form.useValidate(() => {
 *   if (!form.values.email) {
 *     form.setError(form.names.email, "Email is required!");
 *   }
 * });
 *
 * <Form state={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 * </Form>
 * ```
 */
export const FormError = createMemoComponent<FormErrorOptions>((props) => {
  const htmlProps = useFormError(props);
  return createElement("div", htmlProps);
});

export type FormErrorOptions<T extends As = "div"> = Omit<
  CollectionItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
  /**
   * Name of the field.
   */
  name: StringLike;
};

export type FormErrorProps<T extends As = "div"> = Props<FormErrorOptions<T>>;
