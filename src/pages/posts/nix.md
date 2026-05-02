---
layout: ../../layouts/BlogPost.astro
title: "How I use Nix to speed-up my development workflow"
description: "Deterministic package manager, reproducible development environments and other benefits of using Nix"
publishDate: "July 17, 2025"
topic: "workflow"
status: "start"
---

Nix. A language, package manager, build tool and a operating system. Reasoning about it can be tricky, but it’s a powerful tool to have in your toolbox and it's been at the core of my workflow for about two years now.

To preface the following. I am not an expert and have only used a subset of the features of Nix. My primary goal was to check-in version controll my laptop config, to minimise the time it would take to get back online if something were to happen to my laptop. Said and done, that's what `.dotfiles` are for, and I've been using a combination of dotfiles and brew for the last few years, so we should be set.

Although a good start, there are some issues with this approach, well various issues. I'll try to enumerate them in no particular order.

* The non-deterministic model of Brew. If I install a package today, and then try to install it again in 6 months, I might get a different version of the package, which could potentially break my workflow.

* Brew pins packages to the latest vesrions. This means that if I want to use a specific version of a package, I have to manually install it and then pin it, which is a bit of a hassle.

* Dotfiles are not portable enough. However, I do run a few homeservers which are running Linux, and now I would have to maintain a separate set of dotfiles for my laptop and my servers, which is not ideal.

I started looking for alternatives. My main requirements were:

* Reproducability. I want to be able to reproduce my development environment on any machine, at any time.
* Portability. I want to be able to use the same configuration on my laptop and my servers.

This is how I stumbled upon [Nix](https://edolstra.github.io/pubs/phd-thesis.pdf) and it opened my eyes to what a purpose build language for configuration could be. Not only can I control the applications and their versions that I'm installing, I can also control their configuration. This means that I can have a single source of truth for my development environment, and I can easily reproduce it on any machine.

## Installing Nix

Installing nix is not as straightforward as I might like it but the instructions on the [official website](https://nixos.org/download.html) are good enough. A few caveats to be aware of:

* Nix is not available on Windows, so if you're a Windows user, you're out of luck. However, you can use WSL to run Nix on Windows.

* Nix is not available on macOS, but there is a workaround to get it running on macOS. You can use the [nix-darwin](https://github.com/nix-darwin/nix-darwin) project to get Nix running on macOS.

* Nix likes to take over your system. I have been running Nix on my laptop for the past two years without any issues, so it's not a deal breaker. However, it's something to be aware of before you install Nix especially if you're running it in an enterprise environment where you might not have full control over your machine.

* Nix uses a lot of disk space. Nix stores all of its packages in a single directory, which can take up a lot of disk space. However, you can use the `nix-collect-garbage` command to clean up old packages and free up disk space.

## Nix on macOS

My daily driver is a MacBook Pro, so from the start I wanted to get Nix running on macOS, here is where Nix Darwin comes in. Nix Darwin is a project that allows you to run Nix on macOS, and it provides a lot of the same features as Nix on Linux. The main benefit of using Nix Darwin is that it allows you to manage your macOS configuration using Nix. This means that you can have a single source of truth for your macOS configuration, and you can easily reproduce it on any machine.

### Nix-Darwin & Home Manager

The easiest way to think about this is that: nix-darwin manages system-level programs and configuration, while home-manager manages user configuration.

Example nix-darwin configuration:

```nix
# darwin.nix

{ pkgs, ... }: {
  # Enable flakes and optimize storage to save space
  nix.settings = {
    experimental-features = [ "nix-command" "flakes" ];
    auto-optimise-store = true;
  };

  # User Configuration
  users.users.robert = {
    name = "robert";
    home = "/Users/robert";
  };

  # 3. System Packages
  # Essential command line tools
  environment.systemPackages = with pkgs; [
    git
    neovim
    tmux
    ## Add more packages as needed
  ];

  # Create /etc/zshrc that loads the nix-darwin environment
  programs.zsh.enable = true;

  # MacOS System Preferences
  system.defaults = {
    # Keyboard settings
    NSGlobalDomain.KeyRepeat = 2;
    NSGlobalDomain.InitialKeyRepeat = 15;

    # Visual settings (Dock, Finder)
    dock.autohide = true;
    dock.show-recents = false;
    finder.AppleShowAllFiles = true;
  };

  # Keyboard remapping (CapsLock -> Escape)
  system.keyboard.enableKeyMapping = true;
  system.keyboard.remapCapsLockToEscape = true;

  # Use TouchID for `sudo` commands
  security.pam.services.sudo_local.touchIdAuth = true;
}

```

As we can see, there are already a lot of things going on in this configuration. From installing CLI tools, to remapping keys, enabling touch-id for sude and more. Although a small example of why nix is so powerful, it just the begging.

```nix
# home-manager.nix

{ config, pkgs, ... }:

{
  # Home Manager needs a bit of information about you and the paths it should manage.
  home.username = "robert";
  home.homeDirectory = "/home/robert";

  home.stateVersion = "24.05"; # Please update to your actual install version

  # 1. Install Packages "brew layer"
  # These are tools that don't need complex configuration, just the binary.
  home.packages = with pkgs; [
    # Modern CLI replacements
    eza      # Better 'ls'
    ripgrep  # Better 'grep'
    fd       # Better 'find'
    jq       # JSON processor
  ];

  # Configure Programs (The "Dotfiles" layer)
  programs = {
    home-manager.enable = true;

    # Git: Setup user identity and aliases
    git = {
      enable = true;
      userName = "robalaban";
      userEmail = "<you@example.com>";
      extraConfig = {
        init.defaultBranch = "main";
        pull.rebase = true;
      };
    };

    # Starship: A cross-shell prompt
    starship = {
      enable = true;
      settings = {
        add_newline = false;
        aws.disabled = true;
      };
    };

    # FZF: Fuzzy finder
    fzf = {
      enable = true;
      enableZshIntegration = true;
    };
  };
}
```

Now things are a little clear, `darwin.nix` installs zsh / tmux. `home-manager.nix` installs the packages that I want to use and configures them.

## Nix Flakes

A modern way to manage your Nix configuration is to use Nix Flakes. Nix Flakes is a new feature in Nix that allows you to manage your Nix configuration using a single file. This file is called `flake.nix`, and it contains all of the information about your Nix configuration, including the packages you want to install, the configuration for those packages, and any other information that you want to include.

The benefits of using flakes are that alongside the `flake.nix` file, you also get a `flake.lock` file which contains the exact versions of the packages that you're using. This means that you can easily reproduce your Nix configuration on any machine, at any time, and you can be sure that you're using the same versions of the packages.

## Resources

* [Nix Pills](https://nix.dev/tutorials/nix-pills) - A great tutorial series to get started with Nix.
* [Zero-to-Nix](https://zero-to-nix.com/start/install/) - Another great tutorial series to get started with Nix.