# Deploying your app

## Github pages
*If the root folder of your app has the flat html, css and js files*
Go to your repo's settings at https://github.com/username/your-repo/settings
Select the master branch as source in the GH pages section

[example](https://github.com/Razpudding/dynamic-dashboard)

A slightly nicer option is to put those files in a /docs folder and to select the master branch /docs folder option.

You can configure your build tool to put the compiled files into a docs folder of your project and that way the live version of your app will be up-to-date everytime you run the build tool (and push your code)

## Github pages - branch
*If your flat files are in a docs folder in the root of your repo*
Create a new branch in your repo called exactly `gh-pages`. 
Put the compiled files of your app in this branch and commit only those files.
After you've updated that branch, switch back to the master branch to continue working. Anytime you want to update the live version of your app, build the flat files and update them in the gh-pages branch. [example](https://github.com/cmda-tt/course-19-20/tree/gh-pages)

If you want to automate this process, you can use tools like travis to automatically push your files to the gh-pages branch anytime you build your app. [example](https://github.com/cmda-tt/course-19-20/blob/website/.travis.yml)

See the [Github Pages help page](https://help.github.com/en/github/working-with-github-pages/about-github-pages) for more info on Github pages configuration.

## Deployment services
*If you don't to host your app on Github*
Some services like [Heroku](https://www.heroku.com/) or [Zeit](https://zeit.co/) offer simple ways to host your app.
These services often have an option to listen to changes on your master branch and auto deploy them to your app on their server using webhooks.
Alternatively you can use CLI tools to deploy your app on their platform (less cool).
the free options of these platforms often mean your app will shut down if it hasn't been used in the last half hour or so.
Follow the startup guide of the platform to set up your hosted app.

## Custom server
Platforms like Amazon Web Services and Digital Ocean allow you to manage a personal (virtual) server on their platform. This option enables you to build your own custom environment (or use an out-of-the-box environment like a node server) and run your app there.
This is by far the optionw ith the most hassle and I don't recommend it unless you want to get into server management