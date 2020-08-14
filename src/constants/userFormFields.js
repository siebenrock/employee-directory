const userFormFields = [
  {
    heading: "Introduction",
    description:
      "Introduce yourself to others, this can be very professional but also very private and fun",
    fields: [
      {
        label: "Personal Summary",
        type: "paragraph",
        value: "summary",
      },
    ],
  },
  {
    heading: "Contact Details",
    description: "Share your contact information and social media handles",
    fields: [
      {
        // Placeholder to display CDTM email in profile. User form handles this email separately as it cannot be changed
        label: "CDTM Email",
        type: "cdtm-email",
      },
      {
        label: "Phone",
        type: "phone",
        value: "phone",
        tooltip: "Phone number with country code",
      },
      {
        label: "LinkedIn",
        type: "link",
        value: "linkedin",
        icon: "linkedin",
        tooltip:
          "Please enter the full link to your profile. By the way, you can customize it in the LinkedIn settings.",
      },
      {
        community: "cdtm",
        label: "Slack",
        team_id: "T0439JA12",
        type: "slack",
        value: "slack",
        help:
          "In the workspace, click on your name above the channels list, then on Profile & account then on ... in the right sidebar and select Copy member ID",
      },
      {
        label: "Github",
        type: "github",
        value: "github",
        tooltip: "Username",
      },
      {
        label: "Gitlab",
        type: "gitlab",
        value: "gitlab",
        tooltip: "Username",
      },
      {
        label: "Google E-Mail",
        type: "google",
        value: "google",
        help: "Helps to quickly share files in Google Drive with you",
        tooltip: "E-Mail address",
      },
      {
        label: "PayPal",
        type: "link",
        value: "paypal-me",
        icon: "euro",
        help:
          "Receive money from friends by sharing your full paypal.me profile url",
        tooltip: "paypal.me link",
      },
    ],
  },
  {
    heading: "Personal Information",
    description: "About your education, skills, and interest",
    fields: [
      {
        label: "University",
        options: [
          "Technical University of Munich",
          "Ludwig Maximilian University of Munich",
          "Munich University of Applied Sciences",
        ],
        type: "dropdown",
        value: "university",
      },

      {
        icon: "book",
        label: "Study Program",
        type: "text",
        value: "studyprogram",
      },

      {
        label: "Status",
        options: ["Active", "Alumni", "Other"],
        type: "radio",
        value: "status",
        help:
          "Your study status is centrally managed by the course administration, please reach out to the CAs to change it",
        disabled: true,
      },
      {
        label: "Class",
        type: "text",
        disabled: true,
        help:
          "Your cohort is centrally managed by the course administration, please reach out to the CAs to change it",
        value: "cohort",
      },
      {
        label: "Languages",
        optionPreset: "languages",
        type: "tags",
        value: "languages",
      },
      {
        label: "Gender",
        options: ["female", "male", "other"],
        type: "radio",
        value: "gender",
      },
      {
        label: "Nationality",
        type: "text",
        value: "nationality",
      },
      {
        label: "Talk to me about",
        type: "tags",
        otherOptions: true,
        value: "talk-about",
        help: "Provide others with a conversation starter",
      },
    ],
  },
  {
    heading: "Community Support",
    description:
      "Indicate whether you would be available to support the community via expert interviews on request",
    fields: [
      {
        label: "Interview available via",
        options: ["In person", "Phone", "E-Mail", "Skype", "Not available"],
        type: "checkbox",
        value: "available-via",
      },
    ],
  },
];

export { userFormFields as default };
