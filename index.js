/*
                   _                 _
   /\  /\_   _  __| |_ __ __ _ _ __ | |_
  / /_/ / | | |/ _` | '__/ _` | '_ \| __|
 / __  /| |_| | (_| | | | (_| | | | | |_
 \/ /_/  \__, |\__,_|_|  \__,_|_| |_|\__|
         |___/
*/

/**
 * This file is only used by Webpack to handle exporting Hydrant correctly.
 * The statement below simply lets Webpack know to make window.Hydrant
 * accessible when built.
 */

require('expose?Hydrant!./lib/hydrant.js');
