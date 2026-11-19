// Generated from ../words.js. Keep the dictionary and codec in sync.
// PulseDisk doorway dictionary. Its order is part of the address encoding.
const WORDS = [
  "abacus abbey able acacia accordion acorn acre acrylic active adapt adobe agave agile airport airship airy",
  "aisle alarm album alder alert alfalfa algae allegro alley almanac almond aloe alpha alpine amaryllis amber",
  "ambulance amethyst ample anchor anchorage anemone angle anise ankle answer antenna anthem anthill anthology anvil apex",
  "apple apricot apron aqua aquarium aqueduct arbor arc arcade arch archer archery archipelago archway arena armband",
  "armchair armor arrive arrow artist ash aspen aster athlete atlas atoll atom attic aurora author autumn",
  "avalanche avenue avocado award axis axle azalea azure baby backpack backyard bacon badge badger badminton bagel",
  "bagpipe baguette bait bake baker bakery balance balcony ball ballad ballet balloon ballot ballroom bamboo banana",
  "band bandage bandana bandstand banjo bank banker banner barber bard barge barley barn barnacle barnyard barometer",
  "barrel basalt baseball basement basil basin basket basketball basmati bass basset bathtub baton battery bay bayou",
  "bazaar beach beachhead beacon bead beagle beam bean beanbag bear beaver bed bee beech beehive beet",
  "beetle begonia beige belfry bell bench bend beret berry beta bevel bicycle bight bike binder biplane",
  "birch bird birdbath biscuit bison bistro blackberry blackbird blade blanket blaze blend blender blimp blinds blizzard",
  "block bloom blossom blouse blue bluebell blueberry bluebird blues bluff boa board boardwalk boat boathouse bobbin",
  "bobcat bog bolt bond bongo bonnet bonsai book bookcase bookend booklet bookmark bookshop boomerang boot border",
  "bottle boulder boulevard bounce bouquet bowl bowling bowtie box boxcar boxing brace bracket braid bramble bran",
  "branch brass brave bread breeze brick bridge brie briefcase bright brim brioche brisk brisket broccoli brochure",
  "bronze brook broom brownie brush bubble bucket buckle buckwheat bud buff buffalo buffet buggy bugle build",
  "builder bulb bulldog bulldozer bulletin bumblebee bungalow bunker bunny burger burgundy burlap burrito burrow bush butcher",
  "butte butter buttercup butterfly button buzzard cab cabana cabbage cabin cable cablecar caboose cactus cafe cake",
  "calculator calendar calf calico calm camel camellia cameo camera camp camper campsite canal canary candid candle",
  "candlestick candy cannon canoe canoeing canopy cantaloupe canteen canvas canyon cape captain capybara carafe caramel card",
  "cardinal cargo caribou carmine carnation carousel carpenter carpet carriage carrot carry cart carton cascade cashew cashier",
  "cashmere cassette castle cat catalog catamaran catfish catnip cauliflower causeway cave cavern caviar cedar celery cell",
  "cellar cello cereal cerise chain chair chalet chalk chameleon chamomile chandelier channel chapel chapter charcoal chariot",
  "charm charter chartreuse chase chasm cheddar cheer cheery cheese cheetah chemist cherry chess chest chestnut chick",
  "chickpea chiffon chili chimney chinchilla chintz chip chipmunk chisel chord chorus chowder chronicle chutney cider cilantro",
  "cinch cinema circle cirrus citadel citrus clam clasp clay clearing clematis clementine clerk clever cliff climb",
  "clinic clip clipboard clock cloister clothespin cloud cloudburst clover coach coast coaster cobalt cobbler cobra cockatoo",
  "cockpit cocoa coconut coffee coil coin colander coleslaw collar collect columbine comet comic compass condor cook",
  "cookie copper coral cord corduroy core cork corkscrew corn cornbread cornet cornflower corridor cosmos cottage cotton",
  "couch cougar coupe courier courtyard couscous cove cowboy coyote cozy crab crabapple cradle craft crag cranberry",
  "crane crate crater crayon cream creek crepe crest cricket crimson crisp crocus croissant croquet crossroad crouton",
  "crow crowbar crown cruiser crumb crystal cub cube cucumber cufflink cup cupboard cupcake curling curly currant",
  "curry curtain curve cushion custard cutter cyan cyclamen cycling cyclone cymbal cypress dachshund daffodil dahlia dairy",
  "daisy dale dam damask dance dancer dandelion daring dartboard darts dash date dawn daybreak deck deer",
  "dell delta denim dentist depot desert designer desk dew dewdrop dial diamond diary digest dill dime",
  "diner dinghy dinner diploma dipper dirigible disco dish disk dive diver dock dockyard doctor dog dogwood",
  "doll dolphin dome donkey donut door doorbell doormat doorway dot dove downpour draft dragon draw drawer",
  "dream dress drift driveway drizzle drum drummer duck dugout dumbbell dumpling dune dusk dust eager eagle",
  "early earmuff easel easy ebony echo eclair eclipse edamame edelweiss edge editor eel egg eggcup eggplant",
  "elbow elder elk elm ember emerald emu endive engine envelope epic equinox eraser espresso essay estuary",
  "eucalyptus explore fable fabric facet fair fairway falafel falcon fan fancy farm farmer farmhouse fast faucet",
  "fawn feather felt fence fencing fennel fern ferret ferry feta fetch fiber fiddle fiddler field fig",
  "finch find fir fire firefly fireplace fish fishing flag flame flamingo flannel flapjack flare flashlight flask",
  "flax fleece flex flint float flock floodplain flora florist flower fluffy flurry flute fly foam focaccia",
  "focus fog folder folio follow fond fondue football foothill footpath footstool forest forge fork fort forte",
  "forum fossil fountain fox foxglove foyer frame freckle freesia freeway freighter fresh friendly frisbee frittata frog",
  "frost frostbite frosty fruit fuchsia fudge funnel funny fuse galaxy gale galleon gallery gamma gangway garage",
  "garden gardener gardenia garlic garnet garret gate gateway gather gauge gauze gazebo gazelle gear gecko gelato",
  "gem gentle geranium geyser gherkin giant ginger gingerbread gingham giraffe glacier glad glade gladiolus glass glazier",
  "glide glider globe glossary glove glow glyph gnocchi gnome goat goblet goggles gold golden goldenrod goldfish",
  "golf golfer gondola goose gopher gorge gorilla goulash gourd grain granary grand granita granite granola grape",
  "grass grasshopper gravel gravy gray greenhouse greet grid griddle griffin groove grotto grove grow guacamole guard",
  "guava guide guidebook guild guitar gulf gull gully gum gumbo gumdrop gust gymnast hailstone hairbrush halibut",
  "hallway halo ham hamburger hamlet hammer hammock hamster handbook handlebar hangar happy harbor harborside hardy harmonica",
  "harmony harp hat hatchback haven hawk hawthorn hay haze hazel hazelnut headband headlamp headland headline heart",
  "hearth hearty heath heather heatwave hedge hedgehog helicopter helix hemlock herb heron hibiscus highland hike hiker",
  "hill hillside hilltop hinge hippo hive hockey hollow holly hollyhock homestead hominy honest honey honeybee honeydew",
  "honeysuckle hoof hook hop horizon horn horse hose host hosta hostel hotcake hotel hound hourglass house",
  "hovercraft hub hull hum humble hummingbird hummus hurdle hurricane husky hut hyacinth hydrangea ice icicle icon",
  "igloo iguana inch index indigo ink inkwell inlet inn invent iris iron island isle isthmus ivory",
  "ivy jackal jacket jade jaguar jam jambalaya jar jasmine javelin jay jazz jeans jeep jelly jellyfish",
  "jerky jersey jester jet jetstream jetty jewel jigsaw jockey jog joint jolly jonquil journal judge judo",
  "jug juggle juggler juice jukebox jump jumpy jungle juniper kale kangaroo karate kayak kebab keen kelp",
  "kernel ketchup kettle key keyboard keychain khaki kiln kind kingfisher kitchen kite kitten kiwi knee knight",
  "knit knob knoll knot koala kohlrabi kumquat lace lacrosse ladder ladle ladybug lagoon lake lamb lamp",
  "lampshade lane laneway lantern lanyard larder lark larkspur lasagna laser lasso latch latte laugh launch laurel",
  "lava lavender lawn lawyer layer leaf learn leather ledge leek legend lemon lemur lens lentil leopard",
  "letter lettuce level lever lexicon lichen licorice lighthouse lightning lilac lily limb lime limerick limousine linen",
  "linguine link lion listen lively lizard llama lobby lobster locker locket locomotive lodge loft log logbook",
  "lollipop lookout loop lotus lowland lucky lumen lunchbox lupine lute lychee lynx lyric macaroni macaw mackerel",
  "magenta magic magnet magnifier magnolia magpie mailbox mallard mallet manatee mandolin mango mangrove mansion manual maple",
  "marathon marble march marigold marina marjoram market marmot maroon marsh marshmallow marzipan mask mason matrix mauve",
  "mayor meadow meadowland meander meatball medal medic meerkat megaphone mellow melody melon memo memoir mend menu",
  "meringue merry mesa mesh meteor metro metronome microscope midday midnight mighty mill mimosa miner minivan minnow",
  "mint mirror miso mist misty mitten mix mixer moat mocha mockingbird mode modern module mohair molasses",
  "mole monastery moneybox mongoose monk monkey monorail monsoon moon moonbeam moonlight moor moose moped morning moss",
  "moth motor motorbike mound mountain mouse mousetrap mozzarella muffin mug mulberry mule mural museum mushroom muskrat",
  "muslin mustang mustard myrtle nacho nail nanny nap napkin narwhal nasturtium navigator navy neat nebula nectar",
  "nectarine needle nest net netball newsroom nickel nightfall nightingale nimble noble noodle nook noon north notch",
  "notebook nougat nova novel nugget nurse nursery nut nutcracker nutmeg nylon oak oar oasis oat oatcake",
  "oatmeal observatory ocean ocelot ochre octopus okra oleander olive omega omelet onion opal opera opossum orange",
  "orbit orca orchard orchid oregano organza orzo ostrich otter outline outpost oval oven overcast owl oyster",
  "paddle padlock page pagoda pail paint paintbrush painter paisley palace palm pamphlet pancake panda panel pansy",
  "pantry papaya paper paperclip paprika parable parade parcel parfait parlor parrot parsley parsnip partridge pasta pastor",
  "pastry pasture patch path pathway patty pavilion peach peacock peak peanut pear pearl pebble pecan pelican",
  "pencil pendulum penguin peninsula peony pepper peppermint percale pergola periscope periwinkle persimmon pesto petal petunia pewter",
  "pheasant pianist piano pickle pickup picnic pie pier pierogi pigeon pilaf pillow pilot pinball pine pinecone",
  "pink pinnacle pinto pinwheel pipe pirate pistachio pitchfork pivot pixel pizza placemat plaid plain planet plank",
  "plant plantain plateau platypus play playground plaza plinth plover plum plumber plunger pocket poem poet poinsettia",
  "polenta polite polka polo pomelo pond ponder pony poodle pool popcorn poplin poppy porch porcupine porpoise",
  "porridge porter postcard poster potato potter pottery prairie praline preface pretzel primer primrose primula printer prism",
  "projector protractor proud pudding pueblo puffin pulse pumpkin puppet puppy purple pushpin puzzle quad quail quarry",
  "quartz quay quesadilla quest quiche quick quiet quill quilt quince quinoa quokka rabbit raccoon race radar",
  "radiator radicchio radish radius raft rain rainbow rainfall rainstorm raisin rake ranch range ranger rapid rapids",
  "raspberry rattle raven ravine ravioli rayon read recipe recorder red redwood reed reef referee reggae reindeer",
  "relax relay relish rest rhubarb rhythm ribbon rice rickshaw riddle ride rider ridge rim ring ripple",
  "risotto river riverbank rivet road roadster roam robin rock rocket rockpool rodeo rolling rooftop rose rosebud",
  "rosemary rosy rotor rotunda row rowboat rowing ruby rug rugby run russet rust rustic rye saddle",
  "saffron saga sage sagebrush sail sailboat sailor salad salamander salmon saloon salsa salt samba sand sandal",
  "sandbag sandwich sardine sassafras sateen satin sauce saucer savanna scallop scarf scarlet scholar school schoolyard schooner",
  "scissors scone scooter scout screwdriver scroll sculptor seahorse seal seaside season seaweed sector sedan seed seesaw",
  "sepia sequoia serge sesame shack shadow shallot shard shark shelf shell shepherd sherbet shiny ship shipyard",
  "shoal shore shortbread shovel shrimp sidecar sidewalk sienna signal silk silly silver sing singer skate skateboard",
  "skater skating sketch ski skiing skillet skipper skunk sky skyline skyway slate sled sledding sleep sleet",
  "sleigh slide slingshot slipper sloop sloth smart smile smooth smoothie snail snapdragon snappy snooker snorkel snow",
  "snowdrift snowdrop snowfall snowflake snowmobile snug soap soccer sock socket sofa soft softball solstice sonata sonnet",
  "sorbet sorrel souffle sound soup soybean spaghetti spark sparrow spatula speaker speedboat sphere spice spider spin",
  "spinach spinner spiral spit spoke sponge spool spoon spring sprint sprinter sprout spruce squall square squash",
  "squid squirrel stable stack stadium stairway stapler star starfish starlight statue steamboat stem stencil steppe stew",
  "stockyard stone stopwatch storeroom stork storm story stove strait strand straw strawberry stream street stripe stroll",
  "strudel stud studio study submarine subway succotash suede sugar suitcase sumac summit sun sundial sundown sunflower",
  "sunlight sunny sunrise sunroom sunset sunshine super surfer surfing sushi swamp swan sweater sweet swift swim",
  "swing sycamore syllabus table tablet taco tadpole taffeta taffy tahini tail tailor tale tamale tamarack tambourine",
  "tan tangerine tango tansy tapioca tapir tarn tart tartan taupe tawny taxi tea teach teacher teacup",
  "teal teapot telescope tempest tempo tennis tenor tent terrace terrier theater thermos thesis thicket thimble thistle",
  "thread thunder thyme tide tidy tiger tile timber tiny toast toaster toffee tofu token tollbooth tomato",
  "tonic toolbox toothbrush topaz torch tortilla toucan tour tower toy track tractor trail trailer train tram",
  "trampoline travel trawler tree treehouse trek trellis triathlon tricycle trifle trillium tripod tripwire trout trowel truck",
  "truffle trumpet tuba tube tulip tulle tumbleweed tuna tundra tunnel turkey turmeric turnip turnover turquoise turret",
  "turtle tutor tweed twilight twill twirl typewriter typhoon ukulele umber umbrella umpire unicorn upland urchin usher",
  "vacuum valley vanilla vase vector velour velvet vendor veranda verbena vermilion verse vertex vest viaduct viburnum",
  "viewer village vine vinegar vineyard violet violin visit vivid voile volcano vole volleyball vortex voyager vulture",
  "wade wafer waffle wagon waiter walk wallet walleye walnut walrus waltz wand wander warbler warehouse warm",
  "wasabi washboard watercress waterfall wave wax weasel weaver wedge welder wetland whale wharf wheat wheel whirlwind",
  "whisk whistle white wick widget wildcat wildflower willow windmill window windstorm wine wing wink winter wise",
  "wisteria witty wizard wolf wombat wood woodland woodpecker wool workshop wren wrench write writer xylophone yak",
  "yam yard yarn yarrow yellow yoga yogurt yolk young yoyo zebra zesty zinc zinnia zipper zucchini",
].join(' ').split(' ');

const wordIndex = new Map(WORDS.map((word, index) => [word, index]));

function isPrivate(address) {
  return address[0] === 10 || (address[0] === 172 && address[1] >= 16 && address[1] <= 31)
    || (address[0] === 192 && address[1] === 168) || (address[0] === 169 && address[1] === 254);
}

// CRC-12 (0x80f) for the short form, CRC-7 (0x09) for the long form.
function checksum(value, bits, width, poly) {
  let crc = 0;
  const mask = (1 << width) - 1;
  for (let bit = bits - 1; bit >= 0; bit--) {
    const feedback = (crc >> (width - 1)) ^ Number((value >> BigInt(bit)) & 1n);
    crc = ((crc << 1) & mask) ^ (feedback ? poly : 0);
  }
  return BigInt(crc);
}

function encodeAddress(host, port, testLoopback = false) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) throw new Error('Invalid address');
  const octets = host.split('.').map(Number);
  if (octets.some((n) => n > 255) || (!isPrivate(octets) && !(testLoopback && host === '127.0.0.1'))) throw new Error('Invalid address');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  const short = octets[0] === 192;
  const ip = (short ? octets.slice(2) : octets).reduce((value, octet) => (value << 8n) | BigInt(octet), 0n);
  const payload = (ip << 16n) | BigInt(port);
  let value = short ? (payload << 12n) | checksum(payload, 32, 12, 0x80f)
    : (payload << 7n) | checksum(payload, 48, 7, 0x09);
  const words = [];
  for (let i = 0; i < (short ? 4 : 5); i++) {
    words.unshift(WORDS[Number(value & 2047n)]);
    value >>= 11n;
  }
  return words.join(' ');
}

function decodeAddress(words, testLoopback = false) {
  const tokens = words.toLowerCase().trim().split(/[\s-]+/);
  const fail = () => { throw Object.assign(new Error('Check the words on your PC.'), { code: 'BAD_WORDS' }); };
  if (tokens.length !== 4 && tokens.length !== 5) fail();
  let value = 0n;
  for (const word of tokens) {
    const index = wordIndex.get(word);
    if (index === undefined) fail();
    value = (value << 11n) | BigInt(index);
  }
  const short = tokens.length === 4;
  const width = short ? 12n : 7n;
  let payload = value >> width;
  const crc = short ? checksum(payload, 32, 12, 0x80f) : checksum(payload, 48, 7, 0x09);
  if ((value & ((1n << width) - 1n)) !== crc) fail();
  const port = Number(payload & 65535n);
  if (!port) fail();
  payload >>= 16n;
  const octets = [];
  for (let i = 0; i < (short ? 2 : 4); i++) {
    octets.unshift(Number(payload & 255n));
    payload >>= 8n;
  }
  if (short) octets.unshift(192, 168);
  const host = octets.join('.');
  if ((!short && octets[0] === 192) || (!isPrivate(octets) && !(testLoopback && host === '127.0.0.1'))) fail();
  return { host, port };
}

export { encodeAddress, decodeAddress };
