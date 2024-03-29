import Gun from "./Gun";
import { V2 } from "./v2";

export type StageConf = {
  name: string;
  version: string;
  author: string;
  board: string;
};

export type UnitConf = {
  name: string;
  [index: string]: number | string;
};

export type CampaignConf = {
  name: string;
  version: string;
  author: string;
  stage: string;
  guns: Gun | any;
  custom?: boolean;
  units: { [key: string]: UnitConf };
  stages: StageConf[];
};

export type StateConf = {
  activeTeam:number;
  teams:{units:UnitState[]}[];
}

export type UnitState = {
  cid: number
  symbol: string
  hp?: number
  ap?: number
  exhaustion?: number
  stress?: number
  focus?: V2
  velocity?: V2
  faction?: number
  maxHP?: number
}

export let campaigns: CampaignConf[] = [
  {
    name: "Default Campaign",
    version: "0.1",
    author: "Baturinsky, Red Knight",
    stage: "Red Knight's Backyard",
    guns: {
      carbine: {
        name: "Carbine",
        damage: [4, 5],
        damagePenaltyPerCell: 100,
        accuracyPenaltyMax: 20,

        accuracy: 60,
        accuracyOptimalRange: [1, 1],
        accuracyPenaltyPerCell: 1,

        damagePenaltyMax: 2,

        breach: 0
      },

      sniper: {
        name: "Sniper",
        damageOptimalRange: [1, 30],
        damagePenaltyPerCell: 0.1,
        accuracyOptimalRange: [10, 30],
        accuracyPenaltyPerCell: 1,
        breach: 1,
        aggression: -0.1
      },

      shotgun: {
        name: "Shotgun",
        damage: [6, 7],
        damageOptimalRange: [1, 1],
        damagePenaltyMax: 4,
        damagePenaltyPerCell: 0.3,
        accuracy: 80,
        accuracyOptimalRange: [1, 1],
        accuracyPenaltyPerCell: 5,
        accuracyPenaltyMax: 40,
        aggression: 0.1
      }
    },

    units: {
      g: {
        name: "Gunner",
        speed: 4,
        maxHP: 14,
        gun: "carbine"
      },
      a: {
        name: "Assault",
        speed: 6,
        armor: 1,
        gun: "shotgun"
      },
      s: {
        name: "Sharpshooter",
        maxHP: 7,
        def: 10,
        gun: "sniper"
      }
    },

    stages: [
      {
        name: "Backyard 13",
        version: "1",
        author: "baturinsky",
        board: `
    ##################################################
    #      #  a      ++++# + #    ++#  s             #
    # #    #  +         +#   #    ++#  ++++++++      #
    #      +  +         +#   #    ++#  ++++++++      #
    #S#    +  +         +# * #      #                #
    #      #  +          #   #      #                #
    # #    #             #   #      #                #
    #      #  +          ##a## ######                #
    #             *                                  #
    #                                                #
    #A#    #             #s         #a     ~~~       #
    #      #  +          #          #    ~~~~~~      #
    #A#    #  #      #a  #  ###    ++   ~~~#A#~~~    #
    #      #  #      #   #  #      ++       * ~~~    #
    #G#    #  ########   #  #      +#    ~ # #~~     #
    #      #             #          #    ~~~~~~~     #
    # #    ######  ###########  #####      ~~~~      #
    #      #++++      ++ # +        #                #
    #S#    #+            # +   ++   +                #
    #      #            +#          #                #
    #         ######g    #       +  #                #
    #         ######g    #####  #####                #
    #                    #   g      #      #        +#
    #      #          +  #                         ++#
    #G#    #+    *       #+++    +++#   #     #    ++#
    #      #++      +    #          #g               #
    # #    ######++###########++##########    ########
    #                 S+                             #
    #         +              A+                      #
    ##################################################
    `
      },
      {
        name: "Red Knight's Backyard",
        version: "1",
        author: "Red Knight",
        board: `
    ##################################################
    ################# g+         ###++    ##      ++##
    ################# ++         +                 +##
    ####################               a+          +##
    #################                   +    +      ##
    #################* #          ++++      ##      ##
    ####################                     +      ##
    #################        +# + #+a##     g#   ++g##
    ##################+##  ####################  +####
    ###   +++  #*+  # g#   a###################      #
    ###       a#   +# +#    ##########+#++++  #   # *#
    #   +      ###  #  #    #        # a+++   #   ####
    #  g+        #  #+ #       +  +  #              ##
    #   +        ## ## #      g+  +     +           ##
    #                  #  g #        #+  +++  #     ##
    #    + ## ####  #     ++#  +  +  #a  +#+  #     ##
    #    + g# +###  ####    #######  ##########     ##
    #++  + ## ##a+  +  #   +##+a+     + #  +  ##+   ##
    #       # +#       #++ +# + +   +g+ # ++ +#+    ##
    #       # +#   +   #+         +++               ##
    #   #++## +## #+# ##            +               ##
    #   +         +         #         ++      #     ##
    #                  #    # ####### ### ## ### +  ##
    #   #  a+          #g   # a*##++a     #+  #  +  ##
    #~~~~~~~~~ ~~~~~~####  ###########++######## +  ##
    #~~~~~~~~# #~~~~~~##    a+#+ +                  ##
    #~~~~~~~~ *              +     # ##         SAGA##
    ###~~~~~~# #~~~~~~~~           #  #         SGGA##
    ####~~~~~~~~~~~~~~~#           # *#         SAAA##
    ##################################################
    `
      }
    ]
  }
];
