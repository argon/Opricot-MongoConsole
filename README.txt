README

--------------------------------------------------------------------------------
Opricot is a hybrid GUI/CLI/JS web frontend implemented in PHP to manage 
your MongoDB servers and databases. Use as a point-and-click adventure for basic 
tasks, utilize scripting for automated processing or repetitive things. 

Our aim is to provide a snappy, fully featured alternative to the
native MongoDB shell for database management, querying and manipulating data.

It is released under the GNU General Public License, version 3. It also uses a
third-party JSON library from http://www.JSON.org/ 

Only Firefox 3.5 is supported, but should work on most modern browsers.

Browser offline storage is used for storing
command history between sessions; clear the history if any sensitive data
is entered through the commandline.
 
Use at your own risk; this software may or may not work as advertised. 

http://www.icmfinland.fi/oss/opricot/


USAGE

--------------------------------------------------------------------------------

Usage documentation is incorporated directly in the software, so install and, 
run it; you should be able to get started quite easily.
  

INSTALLATION

--------------------------------------------------------------------------------

Copy the files somewhere under your webserver documentroot, that's it. 
If you want, you may change the default MongoDB host and port from index.html.

To enable password protection for the application, edit config.php file.

To enable script library functionality, edit config.php file.

Note that recent versions of MongoDB, PHP and PHP MongoDB driver
must be properly set up.


PRO-TIPS

--------------------------------------------------------------------------------

- Script library functionality allows you to store often used scripts
  or script templates in the database, and share them with other users.

- Use TAB and SHIFT+TAB to hop between command editor and execute button. 

- Use the sample code prefill via the help and actions command for less typing.

- The quick actions command / button allows you to do almost anything
  with point-and-click. 

- Use the actions -> history command to look up your command history and 
  repeat and modify previous actions.
  
- As the syntax is identical, you can copy and paste JSON responses directly to
  command parameters to enter or modify data.

- You can specify commandline contents in URL hash, and bookmark your
  favourite tasks in your browser, share code via PM links, 
  or use it to choose initial settings and connection details.
  
  Add excalamation mark (!) after command to automatically run it instead of
  just prefilling the command editor. 
  
  eg.
  http://mydomain.com/mc/#connect("localhost","5555");use("mydb","mycoll");!

- Feel free to use the PHP AJAX interface from your own code (comm.php).

- Using the built-in object interfaces (mongo, db, coll) instead of built-in
  functions give you more scripting power at the expence of simplicity.
  These objects are internally used by the built-in functions, so you can
  check the commands.*.js files for advanced usage examples.



CHANGELOG

--------------------------------------------------------------------------------

v0.9.3a (2010-02-13)
   
- moved all configuration and authorization setup to config.php file
- fixed wrong _id being passed to command area by document update button
- default host and port can be defined in config.php
- new feature; script library
  - allows to store often-used custom scripts in the database and share with users
  - this uses mongodb as storage, so it's disabled by  default, and must be configured first in config.php
- removed script examples functionality (will be added to the website later)

v0.9.2a (2010-02-02)

- changed application name to "Opricot"

- find results are shown in a user-friendly browser
  - added button to show all fields
  - added button to remove document
  - added button to fill command area with an update command template for the document

- support MongoId type (use these classes in the javascript driver)
- support MongoDate type (use these classes in the javascript driver)
- all commands now wait for previous ajax requests to complete, so that all batch commands work on fresh data

- added simple password protection (edit auth.php to enable and configure)

- show connection details in window title
- now shows databases by default when opening the application
- size of command area can now be changed by dragging
- simplified the help screen
- lots of small css and ui fixes

- works better with different screen resolutions and browser zoom
- now seems to work also with IE8 (definitely not pretty, but works)
- now seems to work also with Chromium browser (not very pretty, but works; should also apply to Google Chrome)
- now seems to work also with Opera (not very pretty, but works)

- now works also when PHP magic quotes are enabled

- some more things i might have forgot to list


v0.9a (2010-01-02) - initial release



FUTURE PLANS

--------------------------------------------------------------------------------

TODO: prettier handling of errors from the ajax interface
TODO: mimic the json type style of mongo http interface http://www.mongodb.org/display/DOCS/Http+Interface
TODO: authentication support (managing users)
TODO: add ability to bookmark whatever is in the editor (url hash feature)
TODO: fix CSS to implement properly the screen-splitting (bottom fixed-sise)
TODO: group() support
TODO: incorporate our Formula -> MongoQuery conversion tool if possible
TODO: some find/query creation helper (maybe FormulaConverter would help)
TODO: GridFS support
TODO: DbRef support
TODO: Profiling level support
TODO: Export / import support
TODO: MongoCode support
TODO: store the last connected host and port in offline settings
TODO: store the last selected database and/or collection in offline settings
TODO: ability to highlight / collapse console results
TODO: prevent wide json strings from stretching UI bigger than screen
TODO: better formatting and UI in console results
TODO: support save() (this might not valid for AJAX frontend)
TODO: implement latest databases and collections history




