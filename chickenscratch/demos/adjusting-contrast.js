/**
 * Changes pages into black-and-white by modifying every element on the
 * page with text so that it is black text on a white background with
 * no background image.
 */

// TODO(mbolin): make this more intuitive for an end-user programmer
// the current implementation requires too much knowledge about CSS

for (e = find('element contains text'); e.hasMatch; e = e.next) {
  e.element.style.color = 'black';
  e.element.style.background = 'white';
  e.element.style.backgroundImage = 'none';
}