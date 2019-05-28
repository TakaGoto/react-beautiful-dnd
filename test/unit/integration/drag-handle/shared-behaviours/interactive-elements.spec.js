// @flow
import React, { type Node } from 'react';
import { render } from 'react-testing-library';
import { forEachSensor, type Control, simpleLift } from './controls';
import { isDragging } from '../util';
import {
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '../../../../../src';
import App, { type Item } from '../app';
import { interactiveTagNames } from '../../../../../src/view/use-sensor-marshal/is-handle-in-interactive-element';

const mixedCase = (obj: Object): string[] => [
  ...Object.keys(obj).map(s => s.toLowerCase()),
  ...Object.keys(obj).map(s => s.toUpperCase()),
];

const forEachTagName = (fn: (tagName: string) => void) =>
  mixedCase(interactiveTagNames).forEach(fn);

forEachSensor((control: Control) => {
  beforeEach(() => {
    // react will log a warning if using upper case
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockRestore();
  });

  it('should not drag if the handle is an interactive element', () => {
    forEachTagName((tagName: string) => {
      const renderItem = (item: Item) => (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
      ) => {
        const TagName = tagName;
        return (
          <TagName
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={item.id}
          />
        );
      };

      const { unmount, getByTestId } = render(<App renderItem={renderItem} />);
      const handle: HTMLElement = getByTestId('0');

      simpleLift(control, handle);

      expect(isDragging(handle)).toBe(false);

      unmount();
    });
  });

  it('should allow dragging from an interactive handle if instructed', () => {
    mixedCase(interactiveTagNames).forEach((tagName: string) => {
      const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];
      const renderItem = (item: Item) => (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
      ) => {
        const TagName = tagName;
        return (
          <TagName
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
            data-testid={item.id}
          />
        );
      };

      const { unmount, getByTestId } = render(
        <App items={items} renderItem={renderItem} />,
      );
      const handle: HTMLElement = getByTestId('0');

      simpleLift(control, handle);

      expect(isDragging(handle)).toBe(true);

      unmount();
    });
  });

  it('should not start a drag if the parent is interactive', () => {
    forEachTagName((tagName: string) => {
      const renderItem = (item: Item) => (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
      ) => {
        const TagName = tagName;
        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
          >
            <TagName data-testid={`inner-${item.id}`} />
          </div>
        );
      };

      const { unmount, getByTestId } = render(<App renderItem={renderItem} />);
      const inner: HTMLElement = getByTestId('inner-0');

      simpleLift(control, inner);

      expect(isDragging(inner)).toBe(false);

      unmount();
    });
  });

  it('should allow dragging from with an interactive parent if instructed', () => {
    forEachTagName((tagName: string) => {
      const items: Item[] = [{ id: '0', canDragInteractiveElements: true }];
      const renderItem = (item: Item) => (
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
      ) => {
        const TagName = tagName;
        return (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            data-is-dragging={snapshot.isDragging}
          >
            <TagName data-testid={`inner-${item.id}`} />
          </div>
        );
      };

      const { unmount, getByTestId } = render(
        <App items={items} renderItem={renderItem} />,
      );
      const inner: HTMLElement = getByTestId('inner-0');

      simpleLift(control, inner);

      expect(isDragging(inner)).toBe(true);

      unmount();
    });
  });
});