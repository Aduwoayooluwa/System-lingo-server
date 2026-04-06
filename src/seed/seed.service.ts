import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { World } from '../entities/world.entity';
import { Lesson, ChallengeType } from '../entities/lesson.entity';
import { Badge } from '../entities/badge.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(World) private worldsRepo: Repository<World>,
    @InjectRepository(Lesson) private lessonsRepo: Repository<Lesson>,
    @InjectRepository(Badge) private badgesRepo: Repository<Badge>,
  ) {}

  async onModuleInit() {
    const worldCount = await this.worldsRepo.count();
    if (worldCount === 0) {
      this.logger.log('🌱 Seeding database...');
      await this.seedWorlds();
      await this.seedBadges();
      this.logger.log('✅ Database seeded successfully');
    } else {
      this.logger.log('Database already seeded, skipping...');
    }
  }

  private async seedWorlds() {
    // World 1: The Basics
    const world1 = await this.worldsRepo.save(
      this.worldsRepo.create({
        title: 'The Basics',
        slug: 'the-basics',
        description:
          "Welcome to your first adventure! You're starting a lemonade stand and need to build a website for it. Learn the fundamental building blocks of any system.",
        orderIndex: 0,
        iconEmoji: '🍋',
        isLocked: false,
        storyTheme: 'Lemonade Stand',
      }),
    );

    // World 2: Getting Faster
    const world2 = await this.worldsRepo.save(
      this.worldsRepo.create({
        title: 'Getting Faster',
        slug: 'getting-faster',
        description:
          "Your lemonade stand evolved into a coffee shop chain! But customers are complaining about slow service. Time to learn about speed!",
        orderIndex: 1,
        iconEmoji: '☕',
        isLocked: true,
        storyTheme: 'Coffee Shop Chain',
      }),
    );

    // World 3: Going Global
    const world3 = await this.worldsRepo.save(
      this.worldsRepo.create({
        title: 'Going Global',
        slug: 'going-global',
        description:
          "You're taking your restaurant international! Customers from around the world want to order, but some are experiencing slow loading times...",
        orderIndex: 2,
        iconEmoji: '🌍',
        isLocked: true,
        storyTheme: 'International Restaurant',
      }),
    );

    // World 4: Handling Complexity
    const world4 = await this.worldsRepo.save(
      this.worldsRepo.create({
        title: 'Handling Complexity',
        slug: 'handling-complexity',
        description:
          "Your food delivery platform is growing fast! One big app is becoming hard to manage. Time to learn about breaking things apart smartly.",
        orderIndex: 3,
        iconEmoji: '🚀',
        isLocked: true,
        storyTheme: 'Food Delivery Platform',
      }),
    );

    // World 5: When Things Break
    const world5 = await this.worldsRepo.save(
      this.worldsRepo.create({
        title: 'When Things Break',
        slug: 'when-things-break',
        description:
          "What happens when a server crashes at 3 AM? Learn to build systems that can handle anything - failures, traffic spikes, and the unexpected.",
        orderIndex: 4,
        iconEmoji: '🛡️',
        isLocked: true,
        storyTheme: 'Scale & Resilience',
      }),
    );

    // === WORLD 1 LESSONS ===
    await this.seedWorld1Lessons(world1.id);
    await this.seedWorld2Lessons(world2.id);
    await this.seedWorld3Lessons(world3.id);
    await this.seedWorld4Lessons(world4.id);
    await this.seedWorld5Lessons(world5.id);
  }

  private async seedWorld1Lessons(worldId: string) {
    // Lesson 1: Client + Server
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'Your First Website',
        slug: 'your-first-website',
        description: 'Learn how a client and server talk to each other — the foundation of every website!',
        orderIndex: 0,
        storyContext:
          "You just started a lemonade stand and want to take orders online! Let's build your very first website.",
        xpReward: 50,
        challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
        steps: [
          {
            id: 'step-1',
            type: 'narrative',
            character: 'servie',
            emotion: 'wave',
            dialogue: "Hi there! I'm Servie the Server 🖥️ Welcome to your first lesson! Ready to build something amazing?",
          },
          {
            id: 'step-2',
            type: 'narrative',
            character: 'servie',
            emotion: 'explain',
            dialogue: "Every website needs two things: a CLIENT (that's the person using a browser) and a SERVER (that's me! I handle requests and send back web pages).",
          },
          {
            id: 'step-3',
            type: 'canvas_task',
            instruction: 'Drag a Client component onto the canvas. This represents a customer visiting your website.',
            action: {
              type: 'drag_component',
              componentType: 'client',
            },
            hint: 'Look in the component library on the left! Drag the Client (the person icon) onto the canvas.',
            successMessage: 'A customer appeared! But they need somewhere to go...',
          },
          {
            id: 'step-4',
            type: 'canvas_task',
            instruction: "Now drag a Server onto the canvas. This will be your lemonade stand's web server!",
            action: {
              type: 'drag_component',
              componentType: 'server',
            },
            hint: "Drag me (Servie) onto the canvas! I'll serve your website to customers.",
            successMessage: "I'm here! Now we need to connect so the customer can reach me.",
          },
          {
            id: 'step-5',
            type: 'canvas_task',
            instruction: 'Draw a connection from the Client to the Server by clicking on the Client and dragging to the Server.',
            action: {
              type: 'connect_nodes',
              sourceNode: 'client',
              targetNode: 'server',
            },
            hint: 'Click and drag from the little dot on the Client to the dot on the Server.',
            successMessage: "Connected! Now the customer can send requests to your server!",
          },
          {
            id: 'step-6',
            type: 'narrative',
            character: 'servie',
            emotion: 'happy',
            dialogue: "Awesome! When a customer types your website address, their browser (the client) sends a REQUEST to me, and I send back a RESPONSE with your lemonade menu! Let's test it!",
          },
          {
            id: 'step-7',
            type: 'canvas_task',
            instruction: "Click the 'Test System' button to send a request and watch the data flow!",
            action: {
              type: 'run_simulation',
            },
            successMessage: '🎉 Your first website is working! The customer can see your lemonade menu!',
          },
          {
            id: 'step-8',
            type: 'narrative',
            character: 'servie',
            emotion: 'celebrate',
            dialogue: "You did it! You just built your first client-server system! 🎉 This is how EVERY website works — from Google to YouTube to your lemonade stand!",
          },
        ],
        initialCanvasState: { nodes: [], edges: [] },
        targetCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 200 }, data: { label: 'Customer' } },
            { id: 'server-1', type: 'server', position: { x: 500, y: 200 }, data: { label: 'Web Server' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
          ],
        },
        challengeConfig: {
          description: 'Build a basic client-server connection for your lemonade stand website',
          requirements: ['At least 1 client node', 'At least 1 server node', 'Client connected to server'],
          requestCount: 5,
          passingScore: 80,
        },
      }),
    );

    // Lesson 2: Adding a Database
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'Remembering Orders',
        slug: 'remembering-orders',
        description: 'Your server needs to remember customer orders! Meet Debby the Database.',
        orderIndex: 1,
        storyContext:
          "Customers are ordering lemonade but you have no way to keep track of the orders! Let's add some memory to your system.",
        xpReward: 75,
        challengeType: ChallengeType.FIX_THE_SYSTEM,
        steps: [
          {
            id: 'step-1',
            type: 'narrative',
            character: 'servie',
            emotion: 'worried',
            dialogue: "Uh oh! Customers are sending me orders but I can't remember them! When I restart, I forget everything. I need help!",
          },
          {
            id: 'step-2',
            type: 'narrative',
            character: 'debby',
            emotion: 'wave',
            dialogue: "Hi! I'm Debby the Database 💾 I can remember EVERYTHING! Orders, customer names, recipes — I store it all safely so nothing gets lost!",
          },
          {
            id: 'step-3',
            type: 'canvas_task',
            instruction: 'Drag a Database onto the canvas. Debby will store all your customer orders!',
            action: {
              type: 'drag_component',
              componentType: 'database',
            },
            hint: 'Find the database icon (looks like a cylinder) in the component library and drag it onto the canvas.',
            successMessage: "Debby is ready! Now let's connect her to Servie.",
          },
          {
            id: 'step-4',
            type: 'canvas_task',
            instruction: 'Connect the Server to the Database so Servie can save and retrieve orders.',
            action: {
              type: 'connect_nodes',
              sourceNode: 'server',
              targetNode: 'database',
            },
            hint: 'Draw a line from the Server to the Database.',
            successMessage: "Now Servie can talk to Debby! Let's see how it works.",
          },
          {
            id: 'step-5',
            type: 'narrative',
            character: 'debby',
            emotion: 'happy',
            dialogue: "Here's how it works: When a customer places an order, Servie sends it to me and I WRITE it down. When Servie needs to check an order, I READ it and send it back. I'm like a super-organized filing cabinet!",
          },
          {
            id: 'step-6',
            type: 'canvas_task',
            instruction: "Test your system! Watch how requests flow from Client → Server → Database and back.",
            action: {
              type: 'run_simulation',
            },
            successMessage: '🎉 Orders are being saved! Debby remembers everything!',
          },
          {
            id: 'step-7',
            type: 'narrative',
            character: 'debby',
            emotion: 'celebrate',
            dialogue: "I'll never forget a single order! Even if Servie restarts, all the data is safe with me. That's the power of a database! 💾✨",
          },
        ],
        initialCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 200 }, data: { label: 'Customer' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Web Server' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
          ],
        },
        targetCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 200 }, data: { label: 'Customer' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Web Server' } },
            { id: 'db-1', type: 'database', position: { x: 700, y: 200 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
            { id: 'e2', source: 'server-1', target: 'db-1', animated: true },
          ],
        },
        challengeConfig: {
          description: 'Fix the system: Servie is losing customer orders! Add a database so orders are remembered.',
          brokenSystemDescription: "The server can't remember orders after restarting. Customers are unhappy!",
          requirements: ['Database connected to server'],
          requestCount: 10,
          passingScore: 80,
        },
      }),
    );

    // Lesson 3: Traffic Spike
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'The Viral Moment',
        slug: 'the-viral-moment',
        description: "A food blogger discovered your lemonade! Now 100 customers are trying to order at once. Can your system handle it?",
        orderIndex: 2,
        storyContext:
          "A famous food blogger just posted about your lemonade! Suddenly, hundreds of people are trying to visit your website at the same time!",
        xpReward: 75,
        challengeType: ChallengeType.SCALE_UP,
        steps: [
          {
            id: 'step-1',
            type: 'narrative',
            character: 'servie',
            emotion: 'excited',
            dialogue: "A blogger wrote about your lemonade! 📱 People are flooding in! This is amazing!",
          },
          {
            id: 'step-2',
            type: 'canvas_task',
            instruction: "Let's simulate 20 customers visiting at once. Click 'Test System' and watch what happens!",
            action: { type: 'run_simulation' },
            successMessage: "Oh no... Servie is getting overwhelmed!",
          },
          {
            id: 'step-3',
            type: 'narrative',
            character: 'servie',
            emotion: 'stressed',
            dialogue: "Too... many... requests! 😰 I can only handle about 5 at a time! The rest are waiting in line and some are giving up and leaving!",
          },
          {
            id: 'step-4',
            type: 'narrative',
            character: 'servie',
            emotion: 'thinking',
            dialogue: "What if there were more of me? Like... what if you CLONED me? Two servers could handle twice the customers!",
          },
          {
            id: 'step-5',
            type: 'quiz',
            instruction: "Servie is overwhelmed! What's the best solution?",
            action: {
              type: 'select_option',
              options: [
                { id: 'a', label: 'Make Servie work faster', correct: false, explanation: "There's a limit to how fast one server can go. This is called 'vertical scaling' and it has limits!" },
                { id: 'b', label: 'Add more servers', correct: true, explanation: "Yes! Adding more servers is called 'horizontal scaling'. It's like hiring more workers when the store gets busy!" },
                { id: 'c', label: 'Tell customers to come back later', correct: false, explanation: "That would lose customers! We need a better solution." },
              ],
            },
            successMessage: "Exactly right! Let's add more servers!",
          },
          {
            id: 'step-6',
            type: 'narrative',
            character: 'servie',
            emotion: 'celebrate',
            dialogue: "You discovered HORIZONTAL SCALING! 🎉 Instead of making one server bigger, we add more servers. It's like opening more checkout lanes when the store is busy!",
          },
        ],
        initialCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 200 }, data: { label: 'Customers' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Web Server' } },
            { id: 'db-1', type: 'database', position: { x: 700, y: 200 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
            { id: 'e2', source: 'server-1', target: 'db-1', animated: true },
          ],
        },
        targetCanvasState: null,
        challengeConfig: {
          description: 'Traffic is increasing in waves! Add servers before the system crashes.',
          waves: [
            { requestCount: 5, delay: 0 },
            { requestCount: 15, delay: 3000 },
            { requestCount: 30, delay: 6000 },
          ],
          passingScore: 60,
        },
      }),
    );

    // Lesson 4: Horizontal Scaling
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'Clone Your Server',
        slug: 'clone-your-server',
        description: 'Learn horizontal scaling by adding multiple servers to handle more customers.',
        orderIndex: 3,
        storyContext:
          "You know you need more servers, but how do you make them all work together? Let's figure it out!",
        xpReward: 100,
        challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
        steps: [
          {
            id: 'step-1',
            type: 'narrative',
            character: 'servie',
            emotion: 'excited',
            dialogue: "Let's add a friend! Drag another server onto the canvas — now there are two of us!",
          },
          {
            id: 'step-2',
            type: 'canvas_task',
            instruction: 'Add a second server to the canvas.',
            action: { type: 'drag_component', componentType: 'server' },
            hint: 'Drag another server from the component library.',
            successMessage: 'Two servers! But wait, how do customers know which one to go to?',
          },
          {
            id: 'step-3',
            type: 'narrative',
            character: 'servie',
            emotion: 'confused',
            dialogue: "Hmm, there's a problem. The customer's browser can only connect to ONE address. How do we split traffic between us?",
          },
          {
            id: 'step-4',
            type: 'quiz',
            instruction: 'With two servers, how should customers be directed?',
            action: {
              type: 'select_option',
              options: [
                { id: 'a', label: 'Tell half the customers to use Server A and half to use Server B', correct: false, explanation: "That's hard to manage and not automatic!" },
                { id: 'b', label: 'Use a Load Balancer to automatically distribute traffic', correct: true, explanation: "A load balancer sits in front of servers and distributes requests evenly. Smart!" },
                { id: 'c', label: 'Let customers randomly pick a server', correct: false, explanation: "Customers don't know about servers — they just type a URL!" },
              ],
            },
            successMessage: "You figured it out! We need a Load Balancer!",
          },
          {
            id: 'step-5',
            type: 'narrative',
            character: 'servie',
            emotion: 'happy',
            dialogue: "We're going to meet Balancy in the next lesson! They're amazing at distributing work fairly. But first, let's practice adding multiple servers!",
          },
          {
            id: 'step-6',
            type: 'canvas_task',
            instruction: 'Connect both servers to the database so they can both access orders.',
            action: { type: 'connect_nodes', sourceNode: 'server', targetNode: 'database' },
            successMessage: "Both servers can now read and write orders! But we still need that load balancer...",
          },
        ],
        initialCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 250 }, data: { label: 'Customers' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 150 }, data: { label: 'Server A' } },
            { id: 'db-1', type: 'database', position: { x: 700, y: 250 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
            { id: 'e2', source: 'server-1', target: 'db-1', animated: true },
          ],
        },
        targetCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 100, y: 250 }, data: { label: 'Customers' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 150 }, data: { label: 'Server A' } },
            { id: 'server-2', type: 'server', position: { x: 400, y: 350 }, data: { label: 'Server B' } },
            { id: 'db-1', type: 'database', position: { x: 700, y: 250 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
            { id: 'e2', source: 'client-1', target: 'server-2', animated: true },
            { id: 'e3', source: 'server-1', target: 'db-1', animated: true },
            { id: 'e4', source: 'server-2', target: 'db-1', animated: true },
          ],
        },
        challengeConfig: {
          description: 'Build a system with multiple servers that can handle 20 customers',
          requirements: ['At least 2 server nodes', 'All servers connected to database', 'Client connected to servers'],
          requestCount: 20,
          passingScore: 70,
        },
      }),
    );

    // Lesson 5: Load Balancer
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'The Fair Distributor',
        slug: 'the-fair-distributor',
        description: 'Meet Balancy the Load Balancer — they make sure every server gets a fair share of work!',
        orderIndex: 4,
        storyContext:
          "With multiple servers, you need someone to direct traffic fairly. Enter Balancy — the ultimate traffic director!",
        xpReward: 100,
        challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
        steps: [
          {
            id: 'step-1',
            type: 'narrative',
            character: 'balancy',
            emotion: 'wave',
            dialogue: "Hey there! I'm Balancy the Load Balancer! ⚖️ Think of me as a traffic cop at a busy intersection. I make sure every server gets a fair share of customers!",
          },
          {
            id: 'step-2',
            type: 'narrative',
            character: 'balancy',
            emotion: 'explain',
            dialogue: "Here's my job: I sit between the customers and the servers. When a request comes in, I pick the least busy server and send the request there. It's called ROUND ROBIN — I take turns!",
          },
          {
            id: 'step-3',
            type: 'canvas_task',
            instruction: "First, remove the direct connection from Client to Server. We'll route through Balancy instead.",
            action: { type: 'drag_component', componentType: 'loadbalancer' },
            hint: 'Drag the Load Balancer (⚖️) from the component library onto the canvas, between the client and servers.',
            successMessage: 'Balancy is in position!',
          },
          {
            id: 'step-4',
            type: 'canvas_task',
            instruction: 'Connect the Client to Balancy, and then Balancy to both servers.',
            action: { type: 'connect_nodes', sourceNode: 'client', targetNode: 'loadbalancer' },
            hint: "Wire it up: Client → Balancy → Server A and Client → Balancy → Server B",
            successMessage: "Traffic is now flowing through Balancy!",
          },
          {
            id: 'step-5',
            type: 'canvas_task',
            instruction: "Let's test with 20 requests and see how Balancy distributes them!",
            action: { type: 'run_simulation' },
            successMessage: "Look at that! Requests are split evenly between the servers! 🎉",
          },
          {
            id: 'step-6',
            type: 'narrative',
            character: 'balancy',
            emotion: 'celebrate',
            dialogue: "Beautiful! I sent 10 requests to Server A and 10 to Server B. Neither one is overwhelmed! That's the power of load balancing!",
          },
          {
            id: 'step-7',
            type: 'narrative',
            character: 'servie',
            emotion: 'happy',
            dialogue: "Thank you Balancy! I feel so much better with a partner helping out. We can handle way more customers now!",
          },
          {
            id: 'step-8',
            type: 'narrative',
            character: 'balancy',
            emotion: 'proud',
            dialogue: "🎓 Congratulations! You've completed World 1: The Basics! You now understand Clients, Servers, Databases, Horizontal Scaling, and Load Balancing. You're on your way to becoming a System Design Pro!",
          },
        ],
        initialCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 50, y: 250 }, data: { label: 'Customers' } },
            { id: 'server-1', type: 'server', position: { x: 500, y: 100 }, data: { label: 'Server A' } },
            { id: 'server-2', type: 'server', position: { x: 500, y: 400 }, data: { label: 'Server B' } },
            { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'server-1', animated: true },
            { id: 'e3', source: 'server-1', target: 'db-1', animated: true },
            { id: 'e4', source: 'server-2', target: 'db-1', animated: true },
          ],
        },
        targetCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 50, y: 250 }, data: { label: 'Customers' } },
            { id: 'lb-1', type: 'loadbalancer', position: { x: 250, y: 250 }, data: { label: 'Load Balancer' } },
            { id: 'server-1', type: 'server', position: { x: 500, y: 100 }, data: { label: 'Server A' } },
            { id: 'server-2', type: 'server', position: { x: 500, y: 400 }, data: { label: 'Server B' } },
            { id: 'db-1', type: 'database', position: { x: 800, y: 250 }, data: { label: 'Orders DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'lb-1', animated: true },
            { id: 'e2', source: 'lb-1', target: 'server-1', animated: true },
            { id: 'e3', source: 'lb-1', target: 'server-2', animated: true },
            { id: 'e4', source: 'server-1', target: 'db-1', animated: true },
            { id: 'e5', source: 'server-2', target: 'db-1', animated: true },
          ],
        },
        challengeConfig: {
          description: 'Build a load-balanced system that can handle 30 customers without any failures!',
          requirements: ['Load Balancer connected to Client', 'At least 2 servers behind Load Balancer', 'All servers connected to database'],
          requestCount: 30,
          passingScore: 85,
        },
      }),
    );
  }

  private async seedWorld2Lessons(worldId: string) {
    await this.lessonsRepo.save(
      this.lessonsRepo.create({
        worldId,
        title: 'The Speed Problem',
        slug: 'the-speed-problem',
        description: 'Customers want their coffee menu FAST! But the database is getting tired from answering the same questions.',
        orderIndex: 0,
        storyContext: "Your coffee shop is popular! The same menu items are requested hundreds of times a day. Debby is exhausted answering the same questions!",
        xpReward: 75,
        challengeType: ChallengeType.FIX_THE_SYSTEM,
        steps: [
          { id: 'step-1', type: 'narrative', character: 'debby', emotion: 'tired', dialogue: "I keep getting asked for the same menu data over and over! Cappuccino ingredients... latte prices... I've answered this 1000 times today!" },
          { id: 'step-2', type: 'narrative', character: 'cappy', emotion: 'wave', dialogue: "Hi! I'm Cappy the Cache! ⚡ I have super-fast memory! I can remember the most popular answers so Debby doesn't have to look them up every time!" },
          { id: 'step-3', type: 'canvas_task', instruction: "Drag a Cache component between the Server and Database.", action: { type: 'drag_component', componentType: 'cache' }, hint: "Find Cappy in the component library!", successMessage: "Cappy is ready to speed things up!" },
          { id: 'step-4', type: 'canvas_task', instruction: "Connect the Server to the Cache, and the Cache to the Database.", action: { type: 'connect_nodes', sourceNode: 'server', targetNode: 'cache' }, successMessage: "Now Servie checks Cappy first before bothering Debby!" },
          { id: 'step-5', type: 'canvas_task', instruction: "Test your system and watch the cache hits and misses!", action: { type: 'run_simulation' }, successMessage: "⚡ Most requests are served from cache — 10x faster! Debby is so relieved!" },
          { id: 'step-6', type: 'narrative', character: 'debby', emotion: 'happy', dialogue: "Thank you Cappy! Now I only get asked about NEW things, not the same questions over and over!" },
        ],
        initialCanvasState: {
          nodes: [
            { id: 'client-1', type: 'client', position: { x: 50, y: 200 }, data: { label: 'Customers' } },
            { id: 'lb-1', type: 'loadbalancer', position: { x: 200, y: 200 }, data: { label: 'Load Balancer' } },
            { id: 'server-1', type: 'server', position: { x: 400, y: 200 }, data: { label: 'Server' } },
            { id: 'db-1', type: 'database', position: { x: 650, y: 200 }, data: { label: 'Menu DB' } },
          ],
          edges: [
            { id: 'e1', source: 'client-1', target: 'lb-1', animated: true },
            { id: 'e2', source: 'lb-1', target: 'server-1', animated: true },
            { id: 'e3', source: 'server-1', target: 'db-1', animated: true },
          ],
        },
        targetCanvasState: null,
        challengeConfig: { description: 'Add a cache to speed up repeated queries!', requirements: ['Cache between server and database'], requestCount: 20, passingScore: 75 },
      }),
    );

    // Placeholder stubs for remaining World 2 lessons
    const world2LessonStubs = [
      { title: 'What to Remember?', slug: 'what-to-remember', description: 'Learn cache strategies — what to keep and when to forget.', orderIndex: 1, xpReward: 75 },
      { title: 'The Library Catalog', slug: 'the-library-catalog', description: 'Databases get slow without indexes. Think of them like a library catalog!', orderIndex: 2, xpReward: 100 },
      { title: 'Reading Buddies', slug: 'reading-buddies', description: 'Add read replicas so multiple copies can answer questions at the same time.', orderIndex: 3, xpReward: 100 },
    ];

    for (const stub of world2LessonStubs) {
      await this.lessonsRepo.save(
        this.lessonsRepo.create({
          worldId,
          ...stub,
          storyContext: stub.description,
          challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
          steps: [
            { id: 'step-1', type: 'narrative', character: 'servie', emotion: 'wave', dialogue: `Welcome to "${stub.title}"! This lesson is coming soon. Stay tuned!` },
          ],
          initialCanvasState: { nodes: [], edges: [] },
          targetCanvasState: null,
          challengeConfig: { description: stub.description, requirements: [], requestCount: 10, passingScore: 70 },
        }),
      );
    }
  }

  private async seedWorld3Lessons(worldId: string) {
    const lessons = [
      { title: 'Faraway Customers', slug: 'faraway-customers', description: "Customers on the other side of the world are experiencing slow loading times!", orderIndex: 0, xpReward: 100 },
      { title: 'Content Everywhere', slug: 'content-everywhere', description: "Meet Cloudy the CDN — delivering content from the closest location!", orderIndex: 1, xpReward: 100 },
      { title: 'Servers Around the World', slug: 'servers-around-the-world', description: "Deploy servers in multiple regions for a truly global system.", orderIndex: 2, xpReward: 125 },
    ];

    for (const lesson of lessons) {
      await this.lessonsRepo.save(
        this.lessonsRepo.create({
          worldId,
          ...lesson,
          storyContext: lesson.description,
          challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
          steps: [
            { id: 'step-1', type: 'narrative', character: 'cloudy', emotion: 'wave', dialogue: `Welcome to "${lesson.title}"! This lesson is coming soon. Stay tuned!` },
          ],
          initialCanvasState: { nodes: [], edges: [] },
          targetCanvasState: null,
          challengeConfig: { description: lesson.description, requirements: [], requestCount: 10, passingScore: 70 },
        }),
      );
    }
  }

  private async seedWorld4Lessons(worldId: string) {
    const lessons = [
      { title: 'The Big Ball of Mud', slug: 'the-big-ball-of-mud', description: "Your app has too many features in one place! It's becoming impossible to manage.", orderIndex: 0, xpReward: 100 },
      { title: 'Breaking Apart', slug: 'breaking-apart', description: "Learn to split a monolith into microservices — small, focused services.", orderIndex: 1, xpReward: 125 },
      { title: 'The API Gateway', slug: 'the-api-gateway', description: "Services need to talk! Add an API Gateway to manage communication.", orderIndex: 2, xpReward: 125 },
      { title: 'Patient Messaging', slug: 'patient-messaging', description: "Meet Quincy the Queue — handling messages when services are busy!", orderIndex: 3, xpReward: 125 },
    ];

    for (const lesson of lessons) {
      await this.lessonsRepo.save(
        this.lessonsRepo.create({
          worldId,
          ...lesson,
          storyContext: lesson.description,
          challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
          steps: [
            { id: 'step-1', type: 'narrative', character: 'quincy', emotion: 'wave', dialogue: `Welcome to "${lesson.title}"! This lesson is coming soon. Stay tuned!` },
          ],
          initialCanvasState: { nodes: [], edges: [] },
          targetCanvasState: null,
          challengeConfig: { description: lesson.description, requirements: [], requestCount: 10, passingScore: 70 },
        }),
      );
    }
  }

  private async seedWorld5Lessons(worldId: string) {
    const lessons = [
      { title: 'Three AM Crash', slug: 'three-am-crash', description: "What happens when a server crashes in the middle of the night?", orderIndex: 0, xpReward: 100 },
      { title: 'Always Have a Backup', slug: 'always-have-a-backup', description: "Redundancy means never losing data or uptime, even when things go wrong.", orderIndex: 1, xpReward: 125 },
      { title: 'The Watchful Eye', slug: 'the-watchful-eye', description: "Meet Monique the Monitor — watching everything and alerting problems!", orderIndex: 2, xpReward: 125 },
      { title: 'Elastic Systems', slug: 'elastic-systems', description: "Auto-scaling means your system grows when busy and shrinks when quiet!", orderIndex: 3, xpReward: 150 },
    ];

    for (const lesson of lessons) {
      await this.lessonsRepo.save(
        this.lessonsRepo.create({
          worldId,
          ...lesson,
          storyContext: lesson.description,
          challengeType: ChallengeType.DESIGN_FROM_SCRATCH,
          steps: [
            { id: 'step-1', type: 'narrative', character: 'monique', emotion: 'wave', dialogue: `Welcome to "${lesson.title}"! This lesson is coming soon. Stay tuned!` },
          ],
          initialCanvasState: { nodes: [], edges: [] },
          targetCanvasState: null,
          challengeConfig: { description: lesson.description, requirements: [], requestCount: 10, passingScore: 70 },
        }),
      );
    }
  }

  private async seedBadges() {
    const badges = [
      { name: 'First Steps', slug: 'first-steps', description: 'Complete your first lesson!', iconEmoji: '👶', criteria: { type: 'lessons_completed', count: 1 } },
      { name: 'Getting Started', slug: 'getting-started', description: 'Complete 3 lessons', iconEmoji: '🌱', criteria: { type: 'lessons_completed', count: 3 } },
      { name: 'Dedicated Learner', slug: 'dedicated-learner', description: 'Complete 5 lessons', iconEmoji: '📚', criteria: { type: 'lessons_completed', count: 5 } },
      { name: 'System Architect', slug: 'system-architect', description: 'Complete 10 lessons', iconEmoji: '🏗️', criteria: { type: 'lessons_completed', count: 10 } },
      { name: 'On Fire!', slug: 'on-fire', description: 'Maintain a 3-day streak', iconEmoji: '🔥', criteria: { type: 'streak', count: 3 } },
      { name: 'Streak Master', slug: 'streak-master', description: 'Maintain a 7-day streak', iconEmoji: '⚡', criteria: { type: 'streak', count: 7 } },
      { name: 'XP Collector', slug: 'xp-collector', description: 'Earn 500 XP', iconEmoji: '💎', criteria: { type: 'xp', count: 500 } },
      { name: 'Level Up!', slug: 'level-up', description: 'Reach Level 3', iconEmoji: '⬆️', criteria: { type: 'level', count: 3 } },
      { name: 'High Achiever', slug: 'high-achiever', description: 'Reach Level 5', iconEmoji: '🌟', criteria: { type: 'level', count: 5 } },
      { name: 'Cache Master', slug: 'cache-master', description: 'Complete the caching lesson', iconEmoji: '⚡', criteria: { type: 'lessons_completed', count: 6 } },
      { name: 'Load Balancing Pro', slug: 'load-balancing-pro', description: 'Master load balancing', iconEmoji: '⚖️', criteria: { type: 'lessons_completed', count: 5 } },
    ];

    for (const badge of badges) {
      await this.badgesRepo.save(this.badgesRepo.create(badge));
    }
  }
}
