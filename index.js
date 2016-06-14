/*
   __    __ _           _                     _               _
 / / /\ \ \ |__   __ _| |_ ___ _ ____      _| |__   ___  ___| |
 \ \/  \/ / '_ \ / _` | __/ _ \ '__\ \ /\ / / '_ \ / _ \/ _ \ |
 \  /\  /| | | | (_| | ||  __/ |   \ V  V /| | | |  __/  __/ |
  \/  \/ |_| |_|\__,_|\__\___|_|    \_/\_/ |_| |_|\___|\___|_|
*/

/**
 * This file is only used by Webpack to handle exporting Whaterwheel correctly.
 * The statement below simply lets Webpack know to make window.Whaterwheel
 * accessible when built.
 */

require('expose?Whaterwheel!./lib/whaterwheel.js');
