import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-details',
  imports: [],
  templateUrl: './game-details.html',
  styleUrl: './game-details.scss',
})
export class GameDetails implements OnInit {
  private route = inject(ActivatedRoute);
  itemId!: string | null;

  ngOnInit() {
    // Method 1: Snapshot (Best if user never changes pages within this component)
    this.itemId = this.route.snapshot.paramMap.get('id');

    // Method 2: Observable subscription (Best if ID changes while component stays active)
    this.route.paramMap.subscribe(params => {
      this.itemId = params.get('id');
      console.log('Dynamic ID:', this.itemId);
    });
  }
}
