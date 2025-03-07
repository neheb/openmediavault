/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2022 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as gettext } from '@biesbjerg/ngx-translate-extract-marker';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';

import { translate } from '~/app/i18n.helper';
import { ModalDialogComponent } from '~/app/shared/components/modal-dialog/modal-dialog.component';
import { Icon } from '~/app/shared/enum/icon.enum';
import { NotificationType } from '~/app/shared/enum/notification-type.enum';
import { DialogService } from '~/app/shared/services/dialog.service';
import { NotificationService } from '~/app/shared/services/notification.service';
import { RpcService } from '~/app/shared/services/rpc.service';

@Component({
  selector: 'omv-apply-config',
  templateUrl: './apply-config.component.html',
  styleUrls: ['./apply-config.component.scss']
})
export class ApplyConfigComponent {
  @BlockUI()
  blockUI: NgBlockUI;

  public icon = Icon;

  constructor(
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
    private rpcService: RpcService
  ) {}

  onApplyPendingChanges(): void {
    this.dialogService
      .open(ModalDialogComponent, {
        data: {
          template: 'confirmation-danger',
          title: gettext('Apply'),
          message: gettext('Do you really want to apply the configuration changes?')
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.blockUI.start(
            translate(gettext('Please wait, the configuration changes are being applied ...'))
          );
          this.rpcService
            .requestTask(
              'Config',
              'applyChangesBg',
              {
                modules: [],
                force: false
              },
              undefined,
              1000
            )
            .pipe(
              finalize(() => {
                this.blockUI.stop();
              })
            )
            .subscribe(() => {
              this.notificationService.show(
                NotificationType.success,
                gettext('Applied the configuration changes.')
              );
            });
        }
      });
  }

  onUndoPendingChanges(): void {
    this.dialogService
      .open(ModalDialogComponent, {
        data: {
          template: 'confirmation-danger',
          title: gettext('Undo'),
          message: gettext('Do you really want to undo the configuration changes?')
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.blockUI.start(
            translate(gettext('Please wait, reverting configuration changes ...'))
          );
          this.rpcService
            .requestTask('Config', 'revertChangesBg', {
              filename: ''
            })
            .pipe(
              finalize(() => {
                this.blockUI.stop();
              })
            )
            .subscribe(() => {
              this.notificationService.show(
                NotificationType.success,
                gettext('Reverted the configuration changes.')
              );
              this.router.navigate(['/reload']);
            });
        }
      });
  }
}
