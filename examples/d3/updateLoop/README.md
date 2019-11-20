# Making a visualization with an update pattern
In this visualization, the data that's rendered in the view changes because of user interaction

## Steps
- Find good example of update loop
- Write a concept that uses interaction (changing scales?)
- Set up basic chart
- Set up interacion
- Set up data filtering
- Link it together

## Concept
A chart showing distribution or relation between to variables.
The vriables can be chosen through a dropdown menu resulting in a rerendering of datapoints and axis.
- Group students by subject interest on x axis.
- Get data from different vars on y axis

## Notes
- Note that d3 has a new way of handling enter, update and exit explicitly as explained in [this article](https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/).
- The options in the form are generated from the data using a data join

## Inspiration
- [Freecodecamp article on the update pattern](https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/)
- [Curran's video on the general update pattern](https://www.youtube.com/watch?time_continue=6&v=IyIAR65G-GQ&feature=emb_logo)
- [An older example I made using variable axes](https://github.com/Razpudding/telegram-analytics/blob/master/index.js)
- [An example from a previous class on the subject using dynamic values and axis](https://github.com/cmda-tt/course-17-18/blob/master/site/class-4/axis/index.js)