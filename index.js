/*
   __          _                     _               _
 / / /\ \ /_ _| |_ ___ _ ____      _| |__   ___  ___| |
 \ \/  \// _` | __/ _ \ '__\ \ /\ / / '_ \ / _ \/ _ \ |
 \  /\  / (_| | ||  __/ |   \ V  V /| | | |  __/  __/ |
  \/  \/ \__,_|\__\___|_|    \_/\_/ |_| |_|\___|\___|_|
*/

/**
 * This file is only used by Webpack to handle exporting Waterwheel correctly.
 * The statement below simply lets Webpack know to make window.Waterwheel
 * accessible when built.
 */

require('expose?Waterwheel!./lib/waterwheel.js');
