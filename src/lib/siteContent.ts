/** Static copy for Contact, Services, About, and Index (no CMS). */

export const CONTACT_ITEMS = [
  {
    icon: 'MapPin' as const,
    title: 'Address',
    lines: ['All Saints CSI Church', 'Mission Quarters, Thrissur', 'Kerala, India - 680001'],
    links: ['https://maps.app.goo.gl/iYnandY5qSTuWxfr8?g_st=iw'],
  },
  {
    icon: 'Phone' as const,
    title: 'Phone',
    lines: ['Office 1: 6282303477', 'Office 2: 7994771842'],
    links: ['tel:+916282303477', 'tel:+917994771842'],
  },
  {
    icon: 'Mail' as const,
    title: 'Email',
    lines: ['allsaintscsichurchtcr2020@gmail.com'],
    links: ['mailto:allsaintscsichurchtcr2020@gmail.com'],
  },
  {
    icon: 'Clock' as const,
    title: 'Office Hours',
    lines: ['Monday - Saturday', '9:00 AM - 5:00 PM'],
  },
];

export const SERVICES_CONTENT = {
  worshipServices: [
    {
      icon: 'Church' as const,
      title: 'Malayalam Holy Communion',
      time: 'Sunday 9:00 AM (1st, 2nd, 3rd & 4th)',
      description: 'Holy Communion in Malayalam on the first four Sundays of the month.',
    },
    {
      icon: 'Church' as const,
      title: 'English Holy Communion',
      time: 'Sunday 7:30 AM (2nd & 4th)',
      description: 'Holy Communion in English on the second and fourth Sundays of the month.',
    },
    {
      icon: 'Church' as const,
      title: 'Malayalam Matins',
      time: 'Sunday 9:00 AM (5th)',
      description: 'Malayalam Matins service on the fifth Sunday of the month.',
    },
    {
      icon: 'Heart' as const,
      title: 'Fasting Prayer',
      time: 'Friday 10:30 AM',
      description: 'A time of fasting and prayer every Friday.',
    },
  ],
  ministries: [
    {
      icon: 'BookOpen' as const,
      title: 'Sunday School',
      time: 'Sundays at 11:00 AM',
      description:
        'Bible-based education for children aged 3-16, nurturing young hearts in faith.',
    },
    {
      icon: 'Users' as const,
      title: 'Youth Fellowship',
      time: 'As announced',
      description: 'Dynamic programs for teens and young adults to explore faith and build friendships.',
    },
    {
      icon: 'Users' as const,
      title: "Men's Fellowship",
      time: 'As announced',
      description:
        'A gathering for men to grow in faith, build brotherhood, and serve together through prayer, study, and fellowship.',
    },
    {
      icon: 'Users' as const,
      title: "Women's Fellowship",
      time: 'As announced',
      description:
        'A gathering for women to grow in faith, build sisterhood, and serve together through prayer, study, and fellowship.',
    },
    {
      icon: 'Music' as const,
      title: 'Choir Ministry',
      time: 'Practice: Saturdays',
      description: 'Lifting voices in praise, our choir leads worship and special musical programs.',
    },
  ],
  sacraments: [
    {
      icon: 'Baby' as const,
      title: 'Baptism',
      time: 'By Appointment',
      description: 'The sacrament of initiation into the Christian faith, celebrating new life in Christ.',
    },
    {
      icon: 'Heart' as const,
      title: 'Holy Matrimony',
      time: 'By Appointment',
      description: 'Sacred celebration of marriage, uniting couples in Christian love and commitment.',
    },
    {
      icon: 'Cross' as const,
      title: 'Holy Communion',
      time: 'Every Sunday except 5th Sunday',
      description: "The Lord's Supper, remembering Christ's sacrifice and receiving His grace.",
    },
    {
      icon: 'HandHeart' as const,
      title: 'Confirmation',
      time: 'Annual Program',
      description: 'Strengthening faith through education and commitment to the church community.',
    },
  ],
  homeTeasers: [
    {
      icon: 'Church' as const,
      title: 'Malayalam Holy Communion',
      time: 'Sunday 9:00 AM (1st, 2nd, 3rd & 4th)',
      description: 'Join us for Holy Communion in Malayalam on the first four Sundays of the month.',
    },
    {
      icon: 'Wine' as const,
      title: 'English Holy Communion',
      time: 'Sunday 7:30 AM (2nd & 4th)',
      description: 'Holy Communion in English on the second and fourth Sundays of the month.',
    },
    {
      icon: 'Sunrise' as const,
      title: 'Malayalam Matins',
      time: 'Sunday 9:00 AM (5th)',
      description: 'Malayalam Matins service on the fifth Sunday of the month.',
    },
    {
      icon: 'Heart' as const,
      title: 'Fasting Prayer',
      time: 'Friday 10:30 AM',
      description: 'A time of fasting and prayer every Friday.',
    },
  ],
};

export const ABOUT_CONTENT = {
  values: [
    {
      icon: 'Heart' as const,
      title: 'Love',
      description: 'Embracing all with the unconditional love of Christ, welcoming everyone as family.',
    },
    {
      icon: 'Target' as const,
      title: 'Faith',
      description: "Grounded in Scripture, trusting in God's plan for our lives and community.",
    },
    {
      icon: 'Eye' as const,
      title: 'Service',
      description: 'Called to serve our community with humility, compassion, and dedication.',
    },
    {
      icon: 'Users' as const,
      title: 'Unity',
      description: 'Building bridges across generations, cultures, and backgrounds in Christ.',
    },
  ],
  timelineItems: [
    {
      date: '1816',
      title: 'The Mission Begins',
      description:
        'The Church Missionary Society (CMS) officially enters the Malabar region, setting the stage for future gospel work in Central Kerala.',
    },
    {
      date: '1836',
      title: 'Thrissur as a Mission Hub',
      description:
        'Missionaries, including Rev. Wood, identify Thrissur strategic potential and establish it as a primary center for their operations.',
    },
    {
      date: '1840 (November 18)',
      title: 'The Turning Point',
      description:
        'Bishop T.G. Spencer of Madras visits. While an initial foundation had been laid near the Kaldaya Kurishupally (estimated at 600 rupees), objections lead to the search for a new, dedicated site.',
    },
    {
      date: 'Late 1840',
      title: 'Land Acquisition',
      description:
        'Rev. Henry Harley and Julius Christopher Kohlhoff successfully petition the government to acquire the extensive plot where the Church stands today.',
    },
    {
      date: '1841',
      title: 'The Building Phase',
      description:
        'Rev. Henry Harley moves to Thrissur. Before the Church is finished, a school is built on-site to host the first worship services and baptisms.',
    },
    {
      date: '1841–1844',
      title: 'Completion',
      description:
        'The Church is completed over a three-year period. The project is notable for the 50 candies of teak wood donated by the Maharaja of Cochin, signaling a unique bond between the Mission and the State.',
    },
  ],
};
